// app/src/utils/reset-token.util.ts

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

/**
 * ============================================================================
 * Utilidades para Tokens de Restablecimiento de Contraseña
 * ============================================================================
 *
 * Centraliza la generación, hasheo y verificación de tokens de un solo uso
 * utilizados en el flujo de `forgotPassword` / `resetPassword`.
 *
 * Responsabilidades:
 *  - Generar un token criptográficamente seguro con `crypto.randomBytes`.
 *  - Hashear el token con `bcrypt` antes de persistirlo (nunca en claro).
 *  - Verificar un token en claro contra su hash persistido.
 *  - Calcular la fecha de expiración del token.
 *
 * Este util NO debe:
 *  - Acceder a la base de datos.
 *  - Enviar correos.
 *  - Conocer entidades del dominio.
 *
 * Arquitectura:
 *  AuthService → reset-token.util → crypto / bcrypt
 *
 * @security
 *  - El token en claro solo vive en memoria y se envía por correo.
 *  - En BD solo se persiste el hash.
 *  - `bcrypt` con costo 10 equilibra seguridad y performance para tokens efímeros.
 * ============================================================================
 */

/** Cantidad de bytes aleatorios para el token (32 → 64 hex chars). */
export const RESET_TOKEN_BYTES = 32;

/** Costo bcrypt para hashear el token de reset. */
export const RESET_TOKEN_BCRYPT_ROUNDS = 10;

/** Tiempo de vida del token de reset (1 hora). */
export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Genera un token aleatorio seguro para restablecimiento de contraseña.
 *
 * @returns {string} Token en formato hex (64 caracteres para 32 bytes).
 */
export const generateResetToken = (): string =>
  crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');

/**
 * Hashea un token de restablecimiento con bcrypt.
 *
 * @param {string} token Token en claro generado por `generateResetToken`.
 * @returns {Promise<string>} Hash bcrypt listo para persistir.
 */
export const hashResetToken = async (token: string): Promise<string> =>
  bcrypt.hash(token, RESET_TOKEN_BCRYPT_ROUNDS);

/**
 * Verifica un token en claro contra su hash persistido.
 *
 * @param {string} token Token en claro recibido del usuario.
 * @param {string} hash Hash bcrypt almacenado en BD.
 * @returns {Promise<boolean>} `true` si coincide, `false` si no.
 */
export const verifyResetToken = async (token: string, hash: string): Promise<boolean> =>
  bcrypt.compare(token, hash);

/**
 * Calcula la fecha de expiración para un token de restablecimiento.
 *
 * @param {Date} from Fecha base (por defecto `new Date()`).
 * @returns {Date} Fecha de expiración (ahora + 1 hora).
 */
export const getResetTokenExpiry = (from: Date = new Date()): Date =>
  new Date(from.getTime() + RESET_TOKEN_EXPIRY_MS);
