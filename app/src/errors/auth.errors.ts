// app/src/errors/auth.errors.ts

import { DomainError } from './base.error.js';

export class AppError extends DomainError {
  public readonly statusCode: number;

  constructor(statusCode: number, code: string, message: string, options?: { cause?: unknown }) {
    super(message, statusCode, code, options);
    this.statusCode = statusCode;
    this.name = new.target.name;
  }

  override toResponse() {
    return {
      status: this.status,
      error: this.code,
      message: this.message,
    };
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(message = 'El correo ya se encuentra registrado') {
    super(409, 'EMAIL_ALREADY_EXISTS', message);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super(401, 'INVALID_CREDENTIALS', message);
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountLockedError extends AppError {
  constructor(message = 'La cuenta está temporalmente bloqueada. Intente más tarde.') {
    super(403, 'ACCOUNT_LOCKED', message);
    this.name = 'AccountLockedError';
  }
}

export class AccountNotActivatedError extends AppError {
  constructor(message = 'La cuenta no está activada') {
    super(403, 'ACCOUNT_NOT_ACTIVATED', message);
    this.name = 'AccountNotActivatedError';
  }
}

export class AccountAlreadyActivatedError extends AppError {
  constructor(message = 'La cuenta ya se encuentra activada') {
    super(409, 'ACCOUNT_ALREADY_ACTIVATED', message);
    this.name = 'AccountAlreadyActivatedError';
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = 'Token inválido o expirado', statusCode = 400, code = 'INVALID_TOKEN') {
    super(statusCode, code, message);
    this.name = 'InvalidTokenError';
  }
}

export class ExpiredTokenError extends InvalidTokenError {
  constructor(message = 'El token ha expirado, solicita uno nuevo') {
    super(message, 400, 'EXPIRED_TOKEN');
    this.name = 'ExpiredTokenError';
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = 'Usuario no encontrado') {
    super(404, 'USER_NOT_FOUND', message);
    this.name = 'UserNotFoundError';
  }
}

export class PasswordMismatchError extends AppError {
  constructor(message = 'Las contraseñas no coinciden o están vacías') {
    super(400, 'PASSWORD_MISMATCH', message);
    this.name = 'PasswordMismatchError';
  }
}

export class WeakPasswordError extends AppError {
  constructor(message = 'La contraseña no cumple con los requisitos de seguridad') {
    super(400, 'WEAK_PASSWORD', message);
    this.name = 'WeakPasswordError';
  }
}
