// app/src/errors/domain-errors.ts

/**
 * Errores de dominio del sistema.
 *
 * Permiten que la capa de servicios comunique situaciones de negocio
 * sin acoplarse a códigos HTTP ni a mensajes literales, y que la capa
 * de controladores los traduzca a las respuestas HTTP apropiadas.
 */

/**
 * Se lanza cuando el correo electrónico proporcionado durante el registro
 * ya se encuentra asociado a una cuenta existente.
 *
 * El controlador debe traducirlo a HTTP 409 (Conflict).
 */
export class EmailAlreadyExistsError extends Error {
  constructor(message = 'El correo ya se encuentra registrado') {
    super(message);
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * Se lanza cuando las credenciales proporcionadas durante el inicio
 * de sesión no son válidas.
 *
 * El controlador debe traducirlo a HTTP 401 (Unauthorized).
 */
export class InvalidCredentialsError extends Error {
  constructor(message = 'Credenciales inválidas') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Se lanza cuando la cuenta se encuentra temporalmente bloqueada
 * por intentos fallidos repetidos.
 *
 * El controlador debe traducirlo a HTTP 403 (Forbidden).
 */
export class AccountLockedError extends Error {
  constructor(message = 'La cuenta está temporalmente bloqueada. Intente más tarde.') {
    super(message);
    this.name = 'AccountLockedError';
  }
}

/**
 * Se lanza cuando la cuenta todavía no ha sido activada mediante
 * la verificación del correo electrónico.
 *
 * El controlador debe traducirlo a HTTP 403 (Forbidden).
 */
export class AccountNotActivatedError extends Error {
  constructor(message = 'La cuenta no está activada') {
    super(message);
    this.name = 'AccountNotActivatedError';
  }
}

/**
 * Se lanza cuando la cuenta ya fue activada previamente.
 *
 * El controlador debe traducirlo a HTTP 409 (Conflict).
 */
export class AccountAlreadyActivatedError extends Error {
  constructor(message = 'La cuenta ya se encuentra activada') {
    super(message);
    this.name = 'AccountAlreadyActivatedError';
  }
}

/**
 * Clase base para errores de tokens inválidos o expirados
 * (verificación de correo, refresh y restablecimiento de contraseña).
 *
 * El controlador debe traducirla a HTTP 400/401 según el flujo.
 */
export class InvalidTokenError extends Error {
  constructor(message = 'Token inválido o expirado') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Se lanza cuando el token proporcionado ya expiró.
 *
 * Extiende `InvalidTokenError`, por lo que cualquier manejo de
 * `InvalidTokenError` también lo captura.
 */
export class ExpiredTokenError extends InvalidTokenError {
  constructor(message = 'El token ha expirado, solicita uno nuevo') {
    super(message);
    this.name = 'ExpiredTokenError';
  }
}

/**
 * Se lanza cuando el usuario referenciado no existe.
 *
 * El controlador debe traducirlo a HTTP 404 (Not Found) o
 * a una respuesta genérica que no revele la existencia del correo.
 */
export class UserNotFoundError extends Error {
  constructor(message = 'Usuario no encontrado') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Se lanza cuando las contraseñas proporcionadas no coinciden.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class PasswordMismatchError extends Error {
  constructor(message = 'Las contraseñas no coinciden o están vacías') {
    super(message);
    this.name = 'PasswordMismatchError';
  }
}

/**
 * Se lanza cuando la contraseña no cumple las reglas de seguridad.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class WeakPasswordError extends Error {
  constructor(message = 'La contraseña no cumple con los requisitos de seguridad') {
    super(message);
    this.name = 'WeakPasswordError';
  }
}
