// app/src/errors/location.errors.ts

import { DomainError } from './base.error.js';

/**
 * Errores de dominio para HU-002 (País → Departamento → Ciudad).
 * Todos extienden `DomainError` para que el `errorHandler` central
 * los traduzca a HTTP sin try/catch en cada controller.
 * Códigos estables para el frontend: LOCATION_*
 */

export class LocationValidationError extends DomainError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, 400, 'LOCATION_VALIDATION_ERROR', options);
  }
}

export class CountryNotFoundError extends DomainError {
  constructor(message = 'El país seleccionado no existe.') {
    super(message, 404, 'COUNTRY_NOT_FOUND');
  }
}

export class CountryInactiveError extends DomainError {
  constructor(message = 'El pais seleccionado no está activo.') {
    super(message, 400, 'DEPARTMENT_INACTIVE');
  }
}

export class DepartmentNotFoundError extends DomainError {
  constructor(message = 'El departamento seleccionado no existe.') {
    super(message, 404, 'DEPARTMENT_NOT_FOUND');
  }
}

export class DepartmentInactiveError extends DomainError {
  constructor(message = 'El departamento seleccionado no está activo.') {
    super(message, 400, 'DEPARTMENT_INACTIVE');
  }
}

export class DepartmentCountryMismatchError extends DomainError {
  constructor(message = 'El departamento no pertenece al país seleccionado.') {
    super(message, 400, 'DEPARTMENT_COUNTRY_MISMATCH');
  }
}

export class CityNotFoundError extends DomainError {
  constructor(message = 'La ciudad seleccionada no existe.') {
    super(message, 404, 'CITY_NOT_FOUND');
  }
}

export class CityInactiveError extends DomainError {
  constructor(message = 'La ciudad seleccionada no está activa.') {
    super(message, 400, 'CITY_INACTIVE');
  }
}

export class CityDepartmentMismatchError extends DomainError {
  constructor(message = 'La ciudad no pertenece al departamento seleccionado.') {
    super(message, 400, 'CITY_DEPARTMENT_MISMATCH');
  }
}

export class CityWithoutCinemaError extends DomainError {
  constructor(message = 'La ciudad seleccionada no cuenta con cines activos.') {
    super(message, 400, 'CITY_WITHOUT_CINEMA');
  }
}
