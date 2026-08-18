import type { AccessTokenPayload } from '../../types/auth.types';

export interface ITokenService {
  /**
   * Genera un token JWT de acceso para el usuario autenticado.
   */
  generateAccessToken(userId: number): string;

  /**
   * Verifica y decodifica un token JWT de acceso
   *
   * @param token - Token JWT a verificar
   * @returns Payload del token si es válido, null si es inválido o está expirado
   */
  verifyAccessToken(token: string): AccessTokenPayload | null;

  /**
   * Extrae el token del header Authorization
   *
   * Espera un header en formato: "Bearer <token>"
   *
   * @param authHeader - Valor del header Authorization
   * @returns Token extraído o null si el formato es inválido
   */
  extractTokenFromHeader(authHeader?: string): string | null;

  /**
   * Decodifica un token JWT sin verificar su firma
   *
   * @param token - Token JWT a decodificar
   * @returns Payload decodificado o null si el token es inválido
   */
  decodeToken(token: string): AccessTokenPayload | null;

  /**
   * Verifica si un token JWT está expirado
   *
   * @param token - Token JWT a verificar
   * @returns true si el token está expirado, false en caso contrario
   */
  isTokenExpired(token: string): boolean;
}
