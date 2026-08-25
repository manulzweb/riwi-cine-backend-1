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
}
