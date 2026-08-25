import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import CinemaFunction from '../models/function.model';
import ReservationSeat from '../models/reservation-seat.model';
import Reservation from '../models/reservation.model';
import Seat from '../models/seat.model';
import SeatType from '../models/seat-type.model';
import seatRepository from '../repositories/seat.repository';
import reservationRepository from '../repositories/reservation.repository';
import { LockSeatsDto } from '../dto/lock-seats.dto';
import { ReleaseSeatsDto } from '../dto/release-seats.dto';
import { IReservationService } from '../services/interfaces/reservation.service.interface';

const RESERVATION_DURATION_MINUTES = 10;
const DEFAULT_MAX_SEATS = 10;

class ReservationService implements IReservationService {
  /**
   * HU-001/SPRINT3
   * Obtiene el mapa de sillas correspondiente a una función.
   */
  async getFunctionSeats(functionId: number): Promise<unknown> {
    const cinemaFunction = await CinemaFunction.findByPk(functionId);

    if (!cinemaFunction) {
      throw new Error('La función no existe.');
    }

    if (!cinemaFunction.isActive && !cinemaFunction.active) {
      throw new Error('La función no está disponible.');
    }

    // Libera reservas que ya hayan expirado antes de consultar
    // la disponibilidad actual.
    await reservationRepository.releaseExpiredReservations();

    const seats = await seatRepository.findByFunctionId(functionId);

    const result = await Promise.all(
      seats.map(async (seat) => {
        const activeReservation = await reservationRepository.findActiveReservationBySeat(
          seat.id,
          functionId,
        );

        let status = 'AVAILABLE';

        if (!seat.isActive) {
          status = 'DISABLED';
        } else if (activeReservation) {
          status = 'TEMPORARILY_RESERVED';
        }

        return {
          id: seat.id,
          row: seat.row,
          number: seat.number,
          type: (seat as Seat & { seatType?: SeatType }).seatType?.name ?? null,
          status,
        };
      }),
    );

    return {
      functionId,
      seats: result,
    };
  }

  /**
   * HU-001/SPRINT3
   * Bloquea temporalmente las sillas seleccionadas.
   *
   * RN-039: bloqueo durante 10 minutos.
   * RN-041: no permite seleccionar sillas ocupadas.
   * RN-043: utiliza transacción para controlar concurrencia.
   */
  async lockSeats(dto: LockSeatsDto): Promise<unknown> {
    const { userId, functionId, seatIds } = dto;

    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    if (!functionId) {
      throw new Error('La función es obligatoria.');
    }

    if (!seatIds || seatIds.length === 0) {
      throw new Error('Debe seleccionar al menos una silla.');
    }

    // Evita recibir IDs duplicados.
    const uniqueSeatIds = [...new Set(seatIds)];

    if (uniqueSeatIds.length !== seatIds.length) {
      throw new Error('No se pueden enviar sillas repetidas.');
    }

    // Límite temporal hasta que exista el campo configurable
    // de administración en CinemaFunction.
    if (uniqueSeatIds.length > DEFAULT_MAX_SEATS) {
      throw new Error(`La función permite seleccionar máximo ${DEFAULT_MAX_SEATS} entradas.`);
    }

    const cinemaFunction = await CinemaFunction.findByPk(functionId);

    if (!cinemaFunction) {
      throw new Error('La función no existe.');
    }

    if (!cinemaFunction.isActive && !cinemaFunction.active) {
      throw new Error('La función no está disponible.');
    }

    return await sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      },
      async (transaction) => {
        // Primero liberamos reservas vencidas.
        await reservationRepository.releaseExpiredReservations(transaction);

        const seats = await seatRepository.findByIds(uniqueSeatIds, functionId);

        if (seats.length !== uniqueSeatIds.length) {
          throw new Error(
            'Una o más sillas no pertenecen a la sala de la función o no están activas.',
          );
        }

        // Verificamos cada silla dentro de la transacción.
        for (const seat of seats) {
          const existingReservation = await reservationRepository.findActiveReservationBySeat(
            seat.id,
            functionId,
            transaction,
          );

          if (existingReservation) {
            throw new Error(`La silla ${seat.row}${seat.number} ya está reservada temporalmente.`);
          }
        }

        const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MINUTES * 60 * 1000);

        const reservation = await reservationRepository.createReservation(
          userId,
          functionId,
          expiresAt,
          transaction,
        );

        const reservationSeats = await reservationRepository.createReservationSeats(
          reservation.id,
          seats.map((seat) => ({
            seatId: seat.id,
            price: Number(cinemaFunction.price),
          })),
          transaction,
        );

        const total = reservationSeats.reduce(
          (sum, reservationSeat) => sum + Number(reservationSeat.price),
          0,
        );

        return {
          reservationId: reservation.id,
          functionId,
          userId,
          status: reservation.status,
          expiresAt,
          durationMinutes: RESERVATION_DURATION_MINUTES,
          seats: seats.map((seat) => ({
            id: seat.id,
            row: seat.row,
            number: seat.number,
            price: Number(cinemaFunction.price),
          })),
          quantity: seats.length,
          total,
        };
      },
    );
  }

  /**
   * HU-001/SPRINT3
   * Libera las sillas de una reserva activa.
   *
   * RN-040: las sillas vuelven a estar disponibles.
   */
  async releaseSeats(dto: ReleaseSeatsDto): Promise<void> {
    const { reservationId, userId } = dto;

    if (!reservationId) {
      throw new Error('El ID de la reserva es obligatorio.');
    }

    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    await sequelize.transaction(async (transaction) => {
      const reservation = await reservationRepository.findByUserId(
        reservationId,
        userId,
        transaction,
      );

      if (!reservation) {
        throw new Error('Reserva no encontrada.');
      }

      if (reservation.status !== 'ACTIVE') {
        throw new Error('La reserva ya no se encuentra activa.');
      }

      await reservationRepository.releaseReservation(reservation.id, transaction);
    });
  }

  /**
   * HU-001/SPRINT3
   * Obtiene el resumen de una reserva.
   */
  async getReservationSummary(reservationId: number, userId: number): Promise<unknown> {
    if (!reservationId) {
      throw new Error('El ID de la reserva es obligatorio.');
    }

    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    // RN-040
    await reservationRepository.releaseExpiredReservations();

    const reservation = await reservationRepository.findByUserId(reservationId, userId);

    if (!reservation) {
      throw new Error('Reserva no encontrada.');
    }

    if (
      reservation.status === 'ACTIVE' &&
      reservation.expiresAt &&
      new Date() > reservation.expiresAt
    ) {
      await reservationRepository.releaseReservation(reservation.id);

      throw new Error('La reserva ha expirado. Las sillas fueron liberadas.');
    }

    const reservationSeats =
      (
        reservation as Reservation & {
          reservationSeats?: ReservationSeat[];
        }
      ).reservationSeats ?? [];

    const seats = await Promise.all(
      reservationSeats.map(async (reservationSeat) => {
        const seat = await Seat.findByPk(reservationSeat.seatId, {
          include: [
            {
              model: SeatType,
              as: 'seatType',
            },
          ],
        });

        return {
          id: reservationSeat.seatId,
          row: seat?.row ?? null,
          number: seat?.number ?? null,
          type: (seat as Seat & { seatType?: SeatType })?.seatType?.name ?? null,
          price: Number(reservationSeat.price),
          status: reservationSeat.status,
        };
      }),
    );

    const total = seats.reduce((sum, seat) => sum + seat.price, 0);

    return {
      reservationId: reservation.id,
      functionId: reservation.functionId,
      status: reservation.status,
      expiresAt: reservation.expiresAt,
      quantity: seats.length,
      seats,
      total,
    };
  }
}

export default new ReservationService();
