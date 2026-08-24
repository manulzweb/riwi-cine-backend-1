// app/src/dto/request/login-user.dto.ts

/**
 * DTO de entrada para el login de usuario.
 *
 * Define los campos mínimos que el cliente debe enviar para autenticarse en la
 * API. Este tipo representa la entrada del endpoint de sesión del usuario.
 *
 * @property {string} email - Correo electrónico del usuario.
 * @property {string} password - Contraseña del usuario.
 *
 * @example
 * const dto: LoginUserRequestDto = {
 *   email: "david@example.com",
 *   password: "Password123!"
 * };
 */
export interface LoginUserRequestDto {
  /** Correo electrónico del usuario. */
  email: string;

  /** Contraseña del usuario. */
  password: string;
}
