// app/src/errors/domain-errors.ts

/**
 * Errores de dominio del sistema.
 *
 * Permiten que la capa de servicios comunique situaciones de negocio
 * sin acoplarse a códigos HTTP ni a mensajes literales, y que la capa
 * de controladores los traduzca a las respuestas HTTP apropiadas.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AppError';
  }

  toResponse() {
    return {
      status: this.statusCode,
      error: this.code,
      message: this.message,
    };
  }
}

/**
 * Se lanza cuando el correo electrónico proporcionado durante el registro
 * ya se encuentra asociado a una cuenta existente.
 */
export class EmailAlreadyExistsError extends AppError {
  constructor(message = 'El correo ya se encuentra registrado') {
    super(409, 'EMAIL_ALREADY_EXISTS', message);
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * Se lanza cuando las credenciales proporcionadas durante el inicio
 * de sesión no son válidas.
 */
export class InvalidCredentialsError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super(401, 'INVALID_CREDENTIALS', message);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Se lanza cuando la cuenta se encuentra temporalmente bloqueada
 * por intentos fallidos repetidos.
 */
export class AccountLockedError extends AppError {
  constructor(message = 'La cuenta está temporalmente bloqueada. Intente más tarde.') {
    super(403, 'ACCOUNT_LOCKED', message);
    this.name = 'AccountLockedError';
  }
}

/**
 * Se lanza cuando la cuenta todavía no ha sido activada mediante
 * la verificación del correo electrónico.
 */
export class AccountNotActivatedError extends AppError {
  constructor(message = 'La cuenta no está activada') {
    super(403, 'ACCOUNT_NOT_ACTIVATED', message);
    this.name = 'AccountNotActivatedError';
  }
}

/**
 * Se lanza cuando la cuenta ya fue activada previamente.
 */
export class AccountAlreadyActivatedError extends AppError {
  constructor(message = 'La cuenta ya se encuentra activada') {
    super(409, 'ACCOUNT_ALREADY_ACTIVATED', message);
    this.name = 'AccountAlreadyActivatedError';
  }
}

/**
 * Clase base para errores de tokens inválidos o expirados.
 */
export class InvalidTokenError extends AppError {
  constructor(message = 'Token inválido o expirado', statusCode = 400, code = 'INVALID_TOKEN') {
    super(statusCode, code, message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Se lanza cuando el token proporcionado ya expiró.
 */
export class ExpiredTokenError extends InvalidTokenError {
  constructor(message = 'El token ha expirado, solicita uno nuevo') {
    super(message, 400, 'EXPIRED_TOKEN');
    this.name = 'ExpiredTokenError';
  }
}

/**
 * Se lanza cuando el usuario referenciado no existe.
 */
export class UserNotFoundError extends AppError {
  constructor(message = 'Usuario no encontrado') {
    super(404, 'USER_NOT_FOUND', message);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Se lanza cuando las contraseñas proporcionadas no coinciden.
 */
export class PasswordMismatchError extends AppError {
  constructor(message = 'Las contraseñas no coinciden o están vacías') {
    super(400, 'PASSWORD_MISMATCH', message);
    this.name = 'PasswordMismatchError';
  }
}

/**
 * Se lanza cuando la contraseña no cumple las reglas de seguridad.
 */
export class WeakPasswordError extends AppError {
  constructor(message = 'La contraseña no cumple con los requisitos de seguridad') {
    super(400, 'WEAK_PASSWORD', message);
    this.name = 'WeakPasswordError';
  }
}
