// app/src/services/interfaces/password.service.interface.ts

/**
 * Resultado generado durante el proceso de protección de una contraseña.
 *
 * `hash` contiene el resultado de aplicar bcrypt sobre la contraseña y
 * `salt` contiene el salt utilizado durante el proceso de generación.
 *
 * La contraseña original nunca forma parte del resultado y no debe
 * almacenarse de ninguna forma en la base de datos.
 */
export interface PasswordHashResult {
  hash: string;
  salt: string;
}

export interface IPasswordService {
  hash(password: string): Promise<PasswordHashResult>;
  verify(password: string, hash: string): Promise<boolean>;
  /**
   * Ejecuta una verificación simulada con costo computacional equivalente
   * (mismo número de rondas BCRYPT_ROUNDS) para mitigar ataques de temporización
   * (Timing Attacks) cuando una cuenta o usuario no existe.
   *
   * @param {string} [password] Contraseña opcional recibida en el login.
   * @returns {Promise<boolean>} Retorna false.
   */
  dummyVerify(password?: string): Promise<boolean>;
}
