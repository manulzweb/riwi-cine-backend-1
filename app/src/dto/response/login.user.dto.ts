/**
 * DTO de salida para el login de usuario.
 *
 * Define el contrato que la API devuelve al cliente tras una autenticación
 * exitosa. Se usa para ocultar detalles del modelo User y del JWT.
 */
export interface LoginUserResponseDto {
  /** Mensaje descriptivo del resultado. */
  message: string;

  /** Tipo de token devuelto. */
  tokenType?: 'Bearer';

  /** JWT de acceso emitido. */
  accessToken?: string;

  /** Identificador del usuario autenticado. */
  userId?: number;
}
