// app/src/services/email-verification-token.service.ts

import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { envConfig } from '../config/env';
import {
  IEmailVerificationTokenService,
  EmailVerificationTokenResult,
} from './interfaces/email-verification-token.service.interface';

/**
 * Servicio encargado de generar y verificar tokens de activación
 * de cuentas mediante correo electrónico.
 *
 * Responsabilidades:
 * - Generar tokens criptográficamente seguros.
 * - Generar hashes para los tokens de verificación.
 * - Calcular la fecha de expiración de los tokens.
 * - Verificar tokens proporcionados por el usuario.
 *
 * El servicio no interactúa directamente con Sequelize ni con
 * los modelos de persistencia.
 *
 * @class EmailVerificationTokenService
 *
 * @security
 * El token en texto plano debe utilizarse únicamente durante
 * el proceso de generación y envío del correo de activación.
 *
 * El sistema debe almacenar exclusivamente el hash del token.
 * El token original nunca debe persistirse en la base de datos.
 */
export class EmailVerificationTokenService implements IEmailVerificationTokenService {
  /**
   * Genera un nuevo token de verificación de correo.
   *
   * El token se genera utilizando `crypto.randomBytes`, proporcionando
   * un valor aleatorio criptográficamente seguro.
   *
   * Posteriormente se genera un hash bcrypt del token para que pueda
   * ser almacenado de forma segura en la base de datos.
   *
   * @returns {Promise<EmailVerificationTokenResult>}
   * Objeto que contiene:
   * - `token`: valor original utilizado para enviar el correo.
   * - `hash`: hash utilizado para persistir el token.
   * - `expiresAt`: fecha de expiración del token.
   */
  async generate(): Promise<EmailVerificationTokenResult> {
    const token = crypto.randomBytes(32).toString('hex');

    const hash = await bcrypt.hash(token, envConfig.BCRYPT.ROUNDS);

    const expiresAt = new Date(
      Date.now() + envConfig.REGISTER.ACTIVATION_TOKEN_EXPIRE_HOURS * 60 * 60 * 1000,
    );

    return {
      token,
      hash,
      expiresAt,
    };
  }

  /**
   * Verifica un token de correo electrónico contra su hash.
   *
   * `bcrypt.compare` realiza la comparación utilizando los parámetros
   * almacenados dentro del hash.
   *
   * @param {string} token
   * Token proporcionado por el usuario.
   *
   * @param {string} hash
   * Hash almacenado en la base de datos.
   *
   * @returns {Promise<boolean>}
   * `true` si el token coincide con el hash.
   * `false` si el token no coincide.
   *
   * @security
   * El token nunca debe compararse directamente con el hash mediante
   * operadores como `===`.
   */
  async verify(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }
}

/**
 * Instancia única del servicio de tokens de verificación utilizada
 * por la aplicación.
 *
 * @constant
 * @type {EmailVerificationTokenService}
 */
export default new EmailVerificationTokenService();
