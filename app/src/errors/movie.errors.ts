// app/src/errors/movie.errors.ts

import { DomainError } from './base.error.js';

/**
 * ============================================================================
 * Errores de Dominio — Películas y Cartelera (HU-003, HU-004, HU-005)
 * ============================================================================
 *
 * Todos los errores extienden de `DomainError` para que el middleware global
 * de errores los traduzca automáticamente a códigos de estado HTTP apropiados
 * sin requerir bloques try/catch repetitivos en la capa de controladores.
 */

/**
 * Error lanzado cuando la película solicitada no existe en la base de datos.
 */
export class MovieNotFoundError extends DomainError {
  constructor(message = 'La película solicitada no fue encontrada.') {
    super(message, 404, 'MOVIE_NOT_FOUND');
  }
}

/**
 * Error lanzado cuando el ID de la película es inválido o no numérico.
 */
export class InvalidMovieIdError extends DomainError {
  constructor(message = 'El ID de la película es inválido.') {
    super(message, 400, 'INVALID_MOVIE_ID');
  }
}

/**
 * Error lanzado cuando los filtros de cartelera contienen parámetros inválidos.
 */
export class MovieFilterValidationError extends DomainError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, 400, 'MOVIE_FILTER_VALIDATION_ERROR', options);
  }
}

/**
 * Error lanzado cuando la fecha del filtro no cumple con el formato ISO `YYYY-MM-DD`
 * o es una fecha no válida.
 */
export class InvalidMovieDateFilterError extends DomainError {
  constructor(
    message = 'La fecha proporcionada para el filtro no es válida. Use el formato YYYY-MM-DD.',
  ) {
    super(message, 400, 'INVALID_MOVIE_DATE_FILTER');
  }
}

/**
 * Error lanzado cuando el identificador de cine en los filtros es inválido.
 */
export class InvalidCinemaFilterError extends DomainError {
  constructor(message = 'El identificador del complejo de cine proporcionado es inválido.') {
    super(message, 400, 'INVALID_CINEMA_FILTER');
  }
}

/**
 * Error lanzado cuando una película no está en estado próximo estreno (RN-017).
 */
export class MovieNotUpcomingError extends DomainError {
  constructor(message = 'La película ya se encuentra en cartelera o no es un próximo estreno.') {
    super(message, 400, 'MOVIE_NOT_UPCOMING');
  }
}

/**
 * Error lanzado cuando el usuario ya tiene registrada una solicitud de notificación (RN-019).
 */
export class NotificationAlreadyRegisteredError extends DomainError {
  constructor(message = 'Ya registraste una solicitud de notificación para esta película.') {
    super(message, 409, 'NOTIFICATION_ALREADY_REGISTERED');
  }
}

/**
 * Error lanzado cuando el usuario solicitado no existe.
 */
export class UserNotFoundError extends DomainError {
  constructor(message = 'El usuario especificado no fue encontrado.') {
    super(message, 404, 'USER_NOT_FOUND');
  }
}

/**
 * Error lanzado cuando el usuario no se encuentra activo.
 */
export class UserInactiveError extends DomainError {
  constructor(message = 'El usuario no se encuentra activo.') {
    super(message, 400, 'USER_INACTIVE');
  }
}
