// app/src/services/password.service.ts

import bcrypt from 'bcryptjs';
import { envConfig } from '../config/env.js';
import { IPasswordService, PasswordHashResult } from './interfaces/password.service.interface.js';

/**
 * Servicio encargado de proteger y verificar contraseñas.
 *
 * Responsabilidades:
 * - Generar un salt criptográficamente seguro y único por contraseña.
 * - Generar hashes utilizando bcrypt.
 * - Verificar contraseñas mediante `bcrypt.compare`.
 * - Evitar que las contraseñas en texto plano sean persistidas.
 *
 * @class PasswordService
 *
 * @security
 * Las contraseñas deben permanecer siempre en texto plano únicamente
 * durante el tiempo necesario para procesarlas. El sistema debe almacenar
 * exclusivamente el hash generado por bcrypt.
 *
 * El número de rondas de bcrypt se obtiene desde `BCRYPT_ROUNDS`,
 * permitiendo ajustar el costo computacional del algoritmo mediante
 * configuración de entorno.
 */
export class PasswordService implements IPasswordService {
  /**
   * Genera un salt criptográficamente seguro y un hash bcrypt
   * para la contraseña proporcionada.
   *
   * El salt es generado de forma aleatoria para cada contraseña.
   * Posteriormente bcrypt utiliza este salt junto con el número de rondas
   * configurado para generar el hash.
   *
   * El uso de un salt diferente por contraseña evita que dos usuarios
   * con la misma contraseña produzcan necesariamente el mismo hash.
   *
   * @param {string} password Contraseña en texto plano proporcionada
   *                          por el usuario.
   *
   * @returns {Promise<PasswordHashResult>}
   * Objeto que contiene el hash bcrypt y el salt utilizado.
   *
   * @security
   * La contraseña en texto plano no debe almacenarse, registrarse en logs,
   * incluirse en respuestas HTTP ni persistirse en ningún sistema.
   *
   * `BCRYPT_ROUNDS` determina el costo computacional de bcrypt. Un valor
   * mayor incrementa el tiempo necesario para generar y verificar hashes,
   * dificultando ataques de fuerza bruta, aunque también aumenta el costo
   * computacional del servidor.
   */
  async hash(password: string): Promise<PasswordHashResult> {
    const salt = await bcrypt.genSalt(envConfig.BCRYPT.ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    return { hash, salt };
  }

  /**
   * Verifica si una contraseña coincide con un hash bcrypt almacenado.
   *
   * No es necesario proporcionar el salt por separado durante la
   * verificación. bcrypt almacena dentro del propio hash la información
   * necesaria para realizar la comparación, incluyendo el salt y el costo
   * utilizado para generarlo.
   *
   * Internamente `bcrypt.compare` procesa la contraseña proporcionada
   * utilizando los parámetros contenidos en el hash y determina si
   * ambas credenciales coinciden.
   *
   * @param {string} password Contraseña proporcionada durante el inicio
   *                          de sesión.
   * @param {string} hash Hash bcrypt almacenado para el usuario.
   *
   * @returns {Promise<boolean>}
   * `true` si la contraseña coincide con el hash; `false` en caso contrario.
   *
   * @security
   * La contraseña nunca se compara directamente con el hash mediante
   * operadores como `===`. La comparación debe realizarse mediante
   * `bcrypt.compare`, que implementa el proceso de verificación apropiado.
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private dummyHashPromise: Promise<string> | null = null;

  private async getDummyHash(): Promise<string> {
    if (!this.dummyHashPromise) {
      this.dummyHashPromise = (async () => {
        const salt = await bcrypt.genSalt(envConfig.BCRYPT.ROUNDS);
        return bcrypt.hash('dummy_timing_mitigation_password', salt);
      })();
    }
    return this.dummyHashPromise;
  }

  /**
   * Ejecuta una verificación simulada utilizando un hash generado con el mismo
   * factor de costo (`envConfig.BCRYPT.ROUNDS`) que las contraseñas reales.
   *
   * Garantiza tiempo de cómputo uniforme para evitar ataques de temporización
   * y enumeración de usuarios (RN-027).
   *
   * @param {string} [password] Contraseña proporcionada en el login.
   * @returns {Promise<boolean>} Siempre `false` al comparar contra el hash dummy.
   */
  async dummyVerify(password?: string): Promise<boolean> {
    const dummyHash = await this.getDummyHash();
    return bcrypt.compare(password ?? 'dummy_password', dummyHash);
  }
}

/**
 * Instancia única del servicio de contraseñas utilizada por la aplicación.
 *
 * @constant
 * @type {PasswordService}
 */
export default PasswordService;
