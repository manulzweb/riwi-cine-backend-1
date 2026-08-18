/**
 * DTO de entrada para la verificación de correo electrónico.
 *
 * El cliente envía el correo y el token de activación que fue generado al
 * registrar la cuenta. El token se valida contra el hash persistido en la base
 * de datos.
 *
 * @property {string} email - Correo electrónico asociado a la cuenta.
 * @property {string} token - Token de activación recibido por correo.
 *
 * @example
 * const dto: VerifyEmailRequestDto = {
 *   email: "david@example.com",
 *   token: "a6b7c8d9e0f1g2h3"
 * };
 */
export interface VerifyEmailRequestDto {
  /** Correo electrónico asociado a la cuenta. */
  email: string;

  /** Token de activación recibido por correo. */
  token: string;
}
