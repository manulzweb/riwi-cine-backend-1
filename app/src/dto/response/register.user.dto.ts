// app/src/dto/response/register.user.dto.ts

/**
 * DTO de salida para el registro de usuario.
 *
 * Se utiliza para devolver al cliente un resumen del resultado del proceso de
 * registro, manteniendo el contrato de API desacoplado de los modelos internos.
 */
export interface RegisterUserResponseDto {
  /** Mensaje descriptivo del resultado. */
  message: string;

  /** Tipo de token, por ejemplo Bearer. */
  tokenType?: 'Bearer';

  /** Token de acceso, si aplica. */
  accessToken?: string;

  /** Identificador del usuario creado. */
  userId?: number;
}
