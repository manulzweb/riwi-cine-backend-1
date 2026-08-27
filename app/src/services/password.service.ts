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
}

/**
 * Instancia única del servicio de contraseñas utilizada por la aplicación.
 *
 * @constant
 * @type {PasswordService}
 */
export default new PasswordService();
