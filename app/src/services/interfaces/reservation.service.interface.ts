// app/src/services/interfaces/reservation.service.interface.ts

import {
  FunctionSeatsResponseDto,
  LockSeatsRequestDto,
  LockSeatsResponseDto,
  ReservationSummaryDto,
} from '../../dto/seat-reservation.dto.js';

export interface ReleaseSeatsDto {
  reservationId: number;
  userId?: number;
}

export interface IReservationService {
  /**
   * Obtiene el mapa interactivo y estado en tiempo real de las sillas de una función (HU-010).
   */
  getFunctionSeats(functionId: number): Promise<FunctionSeatsResponseDto>;

  /**
   * Bloquea temporalmente las sillas seleccionadas durante 10 minutos (RN-039, RN-041, RN-043).
   */
  lockSeats(dto: LockSeatsRequestDto): Promise<LockSeatsResponseDto>;

  /**
   * Libera voluntariamente las sillas de una reserva activa (RN-040).
   */
  releaseSeats(reservationIdOrDto: number | ReleaseSeatsDto, userId?: number): Promise<void>;

  /**
   * Obtiene el resumen detallado de una reserva activa para transferir al carrito.
   */
  getReservationSummary(reservationId: number, userId: number): Promise<ReservationSummaryDto>;
}
