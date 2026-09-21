// app/src/errors/reservation.errors.ts

import { DomainError } from './base.error.js';

/**
 * ============================================================================
 * Errores de Dominio — Selección de Sillas y Reservas (HU-010)
 * ============================================================================
 */

export class InvalidReservationIdError extends DomainError {
  constructor(message = 'El identificador de la reserva es inválido.') {
    super(message, 400, 'INVALID_RESERVATION_ID');
  }
}

export class ReservationNotFoundError extends DomainError {
  constructor(message = 'La reserva solicitada no fue encontrada.') {
    super(message, 404, 'RESERVATION_NOT_FOUND');
  }
}

export class ReservationNotActiveError extends DomainError {
  constructor(message = 'La reserva ya no se encuentra activa o ha expirado.') {
    super(message, 400, 'RESERVATION_NOT_ACTIVE');
  }
}

export class SeatNotFoundError extends DomainError {
  constructor(message = 'Una o más sillas seleccionadas no existen en la sala.') {
    super(message, 404, 'SEAT_NOT_FOUND');
  }
}

export class SeatNotAvailableError extends DomainError {
  constructor(message = 'Una o más sillas ya han sido reservadas o compradas por otro usuario.') {
    super(message, 409, 'SEAT_NOT_AVAILABLE');
  }
}

export class SeatLimitExceededError extends DomainError {
  constructor(limit = 10) {
    super(
      `No es posible reservar más de ${limit} sillas en una sola transacción.`,
      400,
      'SEAT_LIMIT_EXCEEDED',
    );
  }
}

export class UnauthorizedReservationAccessError extends DomainError {
  constructor(message = 'No tienes permiso para modificar o consultar esta reserva.') {
    super(message, 403, 'UNAUTHORIZED_RESERVATION_ACCESS');
  }
}

export class InvalidSeatSelectionError extends DomainError {
  constructor(message = 'Debes seleccionar al menos una silla válida.') {
    super(message, 400, 'INVALID_SEAT_SELECTION');
  }
}
