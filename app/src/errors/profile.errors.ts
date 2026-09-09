// app/src/errors/profile.errors.ts
import { DomainError } from './base.error.js';

export class ProfileNotFoundError extends DomainError {
  constructor(message = 'Perfil de usuario no encontrado.') {
    super(message, 404, 'PROFILE_NOT_FOUND');
    this.name = 'ProfileNotFoundError';
  }
}

export class CityNotFoundError extends DomainError {
  constructor(message = 'La ciudad seleccionada no existe.') {
    super(message, 404, 'CITY_NOT_FOUND');
    this.name = 'CityNotFoundError';
  }
}

export class CinemaNotFoundError extends DomainError {
  constructor(message = 'El cine favorito seleccionado no existe.') {
    super(message, 404, 'CINEMA_NOT_FOUND');
    this.name = 'CinemaNotFoundError';
  }
}
