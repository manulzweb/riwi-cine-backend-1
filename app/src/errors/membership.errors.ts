// app/src/errors/membership.errors.ts
import { DomainError } from './base.error.js';

export class MembershipNotFoundError extends DomainError {
  constructor(message = 'Membresía no encontrada para este usuario.') {
    super(message, 404, 'MEMBERSHIP_NOT_FOUND');
    this.name = 'MembershipNotFoundError';
  }
}

export class MembershipLevelNotFoundError extends DomainError {
  constructor(message = 'Nivel de membresía no encontrado.') {
    super(message, 404, 'MEMBERSHIP_LEVEL_NOT_FOUND');
    this.name = 'MembershipLevelNotFoundError';
  }
}

export class MembershipStatusNotFoundError extends DomainError {
  constructor(message = 'Estado de membresía no encontrado.') {
    super(message, 404, 'MEMBERSHIP_STATUS_NOT_FOUND');
    this.name = 'MembershipStatusNotFoundError';
  }
}

export class DuplicateMembershipError extends DomainError {
  constructor(message = 'El usuario ya cuenta con una membresía digital activa.') {
    super(message, 409, 'DUPLICATE_MEMBERSHIP');
    this.name = 'DuplicateMembershipError';
  }
}
