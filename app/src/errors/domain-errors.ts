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

/**
 * Se lanza cuando los consentimientos obligatorios no fueron aceptados.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class ConsentRequiredError extends Error {
  constructor(
    message = 'Debe aceptar los términos y condiciones y el tratamiento de datos personales.',
  ) {
    super(message);
    this.name = 'ConsentRequiredError';
  }
}

/**
 * Se lanza cuando los correos electrónicos no coinciden.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class EmailMismatchError extends Error {
  constructor(message = 'Los correos no coinciden') {
    super(message);
    this.name = 'EmailMismatchError';
  }
}

/**
 * Se lanza cuando los correos electrónicos de confirmación no coinciden
 * o se confunde con EmailMismatchError para el flujo de registro.
 */
export class ConfigurationError extends Error {
  constructor(message = 'Configuración del sistema faltante o inválida') {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Se lanza cuando el rol por defecto no existe.
 */
export class RoleNotConfiguredError extends ConfigurationError {
  constructor(message = 'No existe el rol por defecto configurado en el sistema') {
    super(message);
    this.name = 'RoleNotConfiguredError';
  }
}

/**
 * Se lanza cuando el nivel de membresía por defecto no existe.
 */
export class MembershipLevelNotConfiguredError extends ConfigurationError {
  constructor(message = 'No existe el nivel de membresía por defecto configurado en el sistema') {
    super(message);
    this.name = 'MembershipLevelNotConfiguredError';
  }
}

/**
 * Se lanza cuando el estado de membresía por defecto no existe.
 */
export class MembershipStatusNotConfiguredError extends ConfigurationError {
  constructor(message = 'No existe el estado de membresía por defecto configurado en el sistema') {
    super(message);
    this.name = 'MembershipStatusNotConfiguredError';
  }
}

/**
 * Se lanza cuando la ciudad principal seleccionada no existe.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class CityNotFoundError extends Error {
  constructor(message = 'La ciudad principal seleccionada no existe') {
    super(message);
    this.name = 'CityNotFoundError';
  }
}

/**
 * Se lanza cuando el complejo favorito seleccionado no existe.
 *
 * El controlador debe traducirlo a HTTP 400 (Bad Request).
 */
export class CinemaNotFoundError extends Error {
  constructor(message = 'El complejo favorito seleccionado no existe') {
    super(message);
    this.name = 'CinemaNotFoundError';
  }
}

/**
 * Se lanza cuando no se pudo generar un código único de membresía tras
 * agotar los reintentos por colisión de constraint único.
 *
 * El controlador debe traducirlo a HTTP 500 (Internal Server Error).
 */
export class MembershipCodeGenerationError extends Error {
  constructor(message = 'No se pudo generar un código único de membresía') {
    super(message);
    this.name = 'MembershipCodeGenerationError';
  }
}
