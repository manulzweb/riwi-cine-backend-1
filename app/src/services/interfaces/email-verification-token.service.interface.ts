export interface EmailVerificationTokenResult {
  token: string;
  hash: string;
  expiresAt: Date;
}

/**
 * Contrato del Servicio de Tokens de Verificación
 * ------------------------------------------------
 * Define las operaciones relacionadas con la generación
 * y verificación criptográfica de tokens de correo electrónico.
 *
 * El servicio no es responsable de persistir información.
 * Las operaciones de base de datos son responsabilidad del Repository.
 */
export interface IEmailVerificationTokenService {
  /**
   * Genera un nuevo token de verificación.
   *
   * Genera un token aleatorio criptográficamente seguro,
   * obtiene su hash y calcula su fecha de expiración.
   *
   * @returns Resultado que contiene el token original,
   * su hash y su fecha de expiración.
   */
  generate(): Promise<EmailVerificationTokenResult>;

  /**
   * Verifica un token proporcionado contra su hash almacenado.
   *
   * @param token Token proporcionado por el usuario.
   *
   * @param hash Hash almacenado en la base de datos.
   *
   * @returns `true` cuando el token coincide con el hash;
   * `false` en caso contrario.
   */
  verify(token: string, hash: string): Promise<boolean>;
}
