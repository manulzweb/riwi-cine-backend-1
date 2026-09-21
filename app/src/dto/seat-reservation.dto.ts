// app/src/dto/seat-reservation.dto.ts

/**
 * Estado visual y funcional de una silla en la función
 */
export type SeatState = 'AVAILABLE' | 'TEMPORARILY_RESERVED' | 'SOLD' | 'DISABLED';

/**
 * Detalle individual de una silla en el mapa de sala
 */
export interface SeatMapItemDto {
  id: number;
  row: string;
  number: number;
  type: string;
  priceFactor: number;
  status: SeatState;
}

/**
 * Respuesta del mapa de sillas interactivo para una función (HU-010)
 */
export interface FunctionSeatsResponseDto {
  functionId: number;
  movieId: number;
  movieTitle: string;
  room: string;
  format: string;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  seats: SeatMapItemDto[];
}

/**
 * Petición para bloquear temporalmente sillas (RN-039)
 */
export interface LockSeatsRequestDto {
  userId: number;
  functionId: number;
  seatIds: number[];
}

/**
 * Detalle de una silla reservada con su precio calculado
 */
export interface ReservedSeatItemDto {
  seatId: number;
  row: string;
  number: number;
  type: string;
  price: number;
}

/**
 * Respuesta al bloquear sillas exitosamente
 */
export interface LockSeatsResponseDto {
  reservationId: number;
  functionId: number;
  userId: number;
  expiresAt: string;
  totalSeats: number;
  subtotal: number;
  seats: ReservedSeatItemDto[];
}

/**
 * Resumen de una reserva activa (para pasar al carrito de compras)
 */
export interface ReservationSummaryDto {
  reservationId: number;
  functionId: number;
  userId: number;
  movieTitle: string;
  format: string;
  room: string;
  startTime: string;
  status: string;
  expiresAt: string;
  totalSeats: number;
  subtotal: number;
  seats: ReservedSeatItemDto[];
}
