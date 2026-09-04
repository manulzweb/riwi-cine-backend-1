// app/src/services/reservation.service.ts

import { Transaction } from 'sequelize';
import sequelize from '../config/database.js';
import CinemaFunction from '../models/function.model.js';
import Reservation from '../models/reservation.model.js';
import ReservationSeat from '../models/reservation-seat.model.js';
import Seat from '../models/seat.model.js';
import SeatType from '../models/seat-type.model.js';
import Movie from '../models/movie.model.js';
import { IReservationService } from './interfaces/reservation.service.interface.js';
import { IReservationRepository } from '../repositories/interfaces/reservation.repository.interface.js';
import { ISeatRepository } from '../repositories/interfaces/seat.repository.interface.js';
import { IFunctionRepository } from '../repositories/interfaces/function.repository.interface.js';
import {
  FunctionSeatsResponseDto,
  LockSeatsRequestDto,
  LockSeatsResponseDto,
  ReservationSummaryDto,
  ReservedSeatItemDto,
  SeatMapItemDto,
  SeatState,
} from '../dto/seat-reservation.dto.js';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
} from '../errors/movie.errors.js';
import {
  InvalidReservationIdError,
  InvalidSeatSelectionError,
  ReservationNotActiveError,
  ReservationNotFoundError,
  SeatLimitExceededError,
  SeatNotAvailableError,
  SeatNotFoundError,
  UnauthorizedReservationAccessError,
} from '../errors/reservation.errors.js';

const RESERVATION_DURATION_MINUTES = 10;
const MAX_SEATS_PER_RESERVATION = 10;

/**
 * Servicio de Selección y Reserva de Sillas (HU-010)
 * --------------------------------------------------
 * Responsable de la lógica de negocio para:
 *  - RN-039: Bloqueo de sillas durante 10 minutos.
 *  - RN-040: Liberación automática de reservas expiradas.
 *  - RN-041: Validación de disponibilidad evitando sillas vendidas/bloqueadas.
 *  - RN-042: Precios según tipo de silla (VIP, General, Preferencial).
 *  - RN-043: Manejo transaccional para control de concurrencia.
 *
 * @class ReservationService
 * @implements {IReservationService}
 */
export class ReservationService implements IReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly functionRepository: IFunctionRepository,
  ) {
    this.reservationRepository = reservationRepository;
    this.seatRepository = seatRepository;
    this.functionRepository = functionRepository;
  }

  /**
   * Obtiene el mapa interactivo de sillas para una función (HU-010).
   */
  async getFunctionSeats(functionId: number): Promise<FunctionSeatsResponseDto> {
    const fn = await this.functionRepository.findById(functionId);
    this.assertFunctionSelectable(fn, functionId);

    // Liberar reservas expiradas antes de consultar (RN-040)
    await this.reservationRepository.releaseExpiredReservations();

    const [allSeats, activeLockedSeats] = await Promise.all([
      this.seatRepository.findByFunctionId(functionId),
      this.reservationRepository.findActiveReservedSeatsByFunction(functionId),
    ]);

    const activeLockedSet = new Set(activeLockedSeats.map((s) => s.seatId));
    const seatDtos = allSeats.map((seat) => this.toSeatMapItem(seat, activeLockedSet));
    const availableCount = seatDtos.filter((s) => s.status === 'AVAILABLE').length;

    const fnWithMovie = fn as CinemaFunction & { movie?: Movie };

    return {
      functionId: fn.id,
      movieId: fn.movieId,
      movieTitle: fnWithMovie.movie?.title ?? 'Película',
      room: fn.room ?? `Sala ${fn.roomId ?? 1}`,
      format: fn.format ?? '2D',
      basePrice: fn.price,
      totalSeats: seatDtos.length,
      availableSeats: availableCount,
      seats: seatDtos,
    };
  }

  /**
   * Bloquea temporalmente las sillas seleccionadas (RN-039, RN-041, RN-043).
   */
  async lockSeats(dto: LockSeatsRequestDto): Promise<LockSeatsResponseDto> {
    this.validateLockInput(dto);

    return await sequelize.transaction(async (t: Transaction) => {
      // 1. Limpieza preventiva de expiradas
      await this.reservationRepository.releaseExpiredReservations(t);

      // 2. Validar función
      const fn = await this.functionRepository.findById(dto.functionId);
      this.assertFunctionSelectable(fn, dto.functionId);

      // 3. Validar existencia de las sillas en la sala
      const seats = await this.seatRepository.findByIds(dto.seatIds, dto.functionId);
      this.assertSeatsBelongToFunction(seats, dto.seatIds);

      // 4. Validar que ninguna silla esté bloqueada o inactiva (RN-041, RN-043)
      await this.assertSeatsAreAvailable(seats, dto.functionId, t);

      // 5. Calcular precios y fecha de expiración (+10 mins)
      const pricedSeats = this.computePricedSeats(seats, fn.price);
      const expiresAt = this.calculateExpiresAt();

      // 6. Crear reserva y detalles dentro de la transacción
      const reservation = await this.reservationRepository.createReservation(
        dto.userId,
        dto.functionId,
        expiresAt,
        t,
      );

      await this.reservationRepository.createReservationSeats(
        reservation.id,
        pricedSeats.map((s) => ({ seatId: s.seatId, price: s.price })),
        t,
      );

      return this.formatLockResponse(reservation, pricedSeats);
    });
  }

  /**
   * Libera voluntariamente las sillas de una reserva activa (RN-040).
   */
  async releaseSeats(
    reservationIdOrDto: number | { reservationId: number; userId?: number },
    userIdParam?: number,
  ): Promise<void> {
    const reservationId =
      typeof reservationIdOrDto === 'number'
        ? reservationIdOrDto
        : reservationIdOrDto.reservationId;
    const userId =
      typeof reservationIdOrDto === 'number' ? userIdParam : reservationIdOrDto.userId ?? userIdParam;

    if (!reservationId || reservationId <= 0) {
      throw new InvalidReservationIdError();
    }

    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    if (userId && reservation.userId !== userId) {
      throw new UnauthorizedReservationAccessError();
    }

    await this.reservationRepository.releaseReservation(reservationId);
  }

  /**
   * Obtiene el resumen de una reserva activa para armar el carrito.
   */
  async getReservationSummary(
    reservationId: number,
    userId: number,
  ): Promise<ReservationSummaryDto> {
    if (!reservationId || reservationId <= 0) {
      throw new InvalidReservationIdError();
    }

    await this.reservationRepository.releaseExpiredReservations();

    const reservation = await this.reservationRepository.findByIdWithDetails(reservationId);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    if (reservation.userId !== userId) {
      throw new UnauthorizedReservationAccessError();
    }

    if (reservation.status !== 'ACTIVE') {
      throw new ReservationNotActiveError();
    }

    if (reservation.expiresAt && new Date(reservation.expiresAt).getTime() <= Date.now()) {
      throw new ReservationNotActiveError('La reserva ha expirado.');
    }

    return this.buildSummaryDto(reservation);
  }

  // ==========================================================================
  // Funciones Privadas Helper
  // ==========================================================================

  /**
   * Valida que la función exista, esté activa y no haya iniciado aún.
   */
  private assertFunctionSelectable(
    fn: CinemaFunction | null,
    functionId: number,
  ): asserts fn is CinemaFunction {
    if (!fn) {
      throw new FunctionNotFoundError(`No se encontró la función con id ${functionId}.`);
    }

    if (fn.isActive === false || fn.active === false) {
      throw new FunctionInactiveError();
    }

    const startTime = fn.startTime ? new Date(fn.startTime).getTime() : 0;
    if (startTime > 0 && startTime <= Date.now()) {
      throw new FunctionAlreadyStartedError();
    }
  }

  /**
   * Valida los datos de entrada para la solicitud de bloqueo.
   */
  private validateLockInput(dto: LockSeatsRequestDto): void {
    if (!dto.userId || dto.userId <= 0) {
      throw new InvalidReservationIdError('El usuario es obligatorio.');
    }

    if (!dto.functionId || dto.functionId <= 0) {
      throw new InvalidReservationIdError('La función es obligatoria.');
    }

    if (!dto.seatIds || !Array.isArray(dto.seatIds) || dto.seatIds.length === 0) {
      throw new InvalidSeatSelectionError();
    }

    if (dto.seatIds.length > MAX_SEATS_PER_RESERVATION) {
      throw new SeatLimitExceededError(MAX_SEATS_PER_RESERVATION);
    }
  }

  /**
   * Transforma una instancia de Seat al DTO del mapa interactivo.
   */
  private toSeatMapItem(seat: Seat, activeLockedSeatIds: Set<number>): SeatMapItemDto {
    const seatType = (seat as Seat & { seatType?: SeatType }).seatType;
    const typeName = seatType?.name ?? 'General';
    const priceFactor = seatType?.priceFactor ? Number(seatType.priceFactor) : 1.0;

    let status: SeatState = 'AVAILABLE';
    if (!seat.isActive || !seat.isAvailable) {
      status = 'DISABLED';
    } else if (activeLockedSeatIds.has(seat.id)) {
      status = 'TEMPORARILY_RESERVED';
    }

    return {
      id: seat.id,
      row: seat.row,
      number: seat.number,
      type: typeName,
      priceFactor,
      status,
    };
  }

  /**
   * Valida que todas las sillas solicitadas existan y correspondan a la función.
   */
  private assertSeatsBelongToFunction(seats: Seat[], requestedSeatIds: number[]): void {
    if (seats.length !== requestedSeatIds.length) {
      throw new SeatNotFoundError();
    }
  }

  /**
   * Valida en tiempo real que ninguna silla esté bloqueada o inactiva (RN-041).
   */
  private async assertSeatsAreAvailable(
    seats: Seat[],
    functionId: number,
    t?: Transaction,
  ): Promise<void> {
    for (const seat of seats) {
      if (!seat.isActive || !seat.isAvailable) {
        throw new SeatNotAvailableError(
          `La silla ${seat.row}${seat.number} no se encuentra habilitada.`,
        );
      }

      const activeReservation = await this.reservationRepository.findActiveReservationBySeat(
        seat.id,
        functionId,
        t,
      );

      if (activeReservation) {
        throw new SeatNotAvailableError(
          `La silla ${seat.row}${seat.number} ya se encuentra reservada o comprada.`,
        );
      }
    }
  }

  /**
   * Calcula el precio final por cada silla aplicando el factor del tipo de silla (RN-042).
   */
  private computePricedSeats(seats: Seat[], basePrice: number): ReservedSeatItemDto[] {
    return seats.map((seat) => {
      const seatType = (seat as Seat & { seatType?: SeatType }).seatType;
      const typeName = seatType?.name ?? 'General';
      const factor = seatType?.priceFactor ? Number(seatType.priceFactor) : 1.0;
      const price = Math.round(basePrice * factor);

      return {
        seatId: seat.id,
        row: seat.row,
        number: seat.number,
        type: typeName,
        price,
      };
    });
  }

  /**
   * Calcula el timestamp de expiración (10 minutos a partir de ahora).
   */
  private calculateExpiresAt(): Date {
    return new Date(Date.now() + RESERVATION_DURATION_MINUTES * 60 * 1000);
  }

  /**
   * Construye el DTO de respuesta para un bloqueo exitoso.
   */
  private formatLockResponse(
    reservation: Reservation,
    pricedSeats: ReservedSeatItemDto[],
  ): LockSeatsResponseDto {
    const subtotal = pricedSeats.reduce((acc, s) => acc + s.price, 0);

    return {
      reservationId: reservation.id,
      functionId: reservation.functionId,
      userId: reservation.userId,
      expiresAt: reservation.expiresAt ? reservation.expiresAt.toISOString() : '',
      totalSeats: pricedSeats.length,
      subtotal,
      seats: pricedSeats,
    };
  }

  /**
   * Construye el DTO de resumen de reserva a partir del modelo con relaciones cargadas.
   */
  private buildSummaryDto(reservation: Reservation): ReservationSummaryDto {
    const fn = (reservation as Reservation & { function?: CinemaFunction }).function;
    const movie = fn ? (fn as CinemaFunction & { movie?: Movie }).movie : undefined;
    const rawSeats = (
      reservation as Reservation & {
        reservationSeats?: (ReservationSeat & { seat?: Seat & { seatType?: SeatType } })[];
      }
    ).reservationSeats ?? [];

    const seats: ReservedSeatItemDto[] = rawSeats.map((rs) => ({
      seatId: rs.seatId,
      row: rs.seat?.row ?? '',
      number: rs.seat?.number ?? 0,
      type: rs.seat?.seatType?.name ?? 'General',
      price: Number(rs.price),
    }));

    const subtotal = seats.reduce((acc, s) => acc + s.price, 0);

    return {
      reservationId: reservation.id,
      functionId: reservation.functionId,
      userId: reservation.userId,
      movieTitle: movie?.title ?? 'Película',
      format: fn?.format ?? '2D',
      room: fn?.room ?? 'Sala Estándar',
      startTime: fn?.startTime ? new Date(fn.startTime).toISOString() : '',
      status: reservation.status,
      expiresAt: reservation.expiresAt ? new Date(reservation.expiresAt).toISOString() : '',
      totalSeats: seats.length,
      subtotal,
      seats,
    };
  }
}

export default ReservationService;
