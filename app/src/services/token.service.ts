import jwt, { type SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { ITokenService } from './interfaces/token.service.interface';

/**
 * Servicio encargado de generar tokens de acceso JWT.
 *
 * Responsabilidades:
 * - Generar tokens JWT de corta duración.
 * - Identificar al usuario mediante el claim `sub`.
 * - Identificar el tipo de token mediante el claim `type`.
 * - Aplicar la configuración de seguridad definida en `envConfig`.
 *
 * @class TokenService
 *
 * @security
 * Los tokens generados deben utilizarse únicamente para la autenticación
 * y autorización de las solicitudes. La información incluida en el token
 * debe ser mínima y no debe contener datos sensibles.
 */
export class TokenService implements ITokenService {
  /**
   * Genera un token JWT de acceso para el usuario autenticado.
   *
   * El token contiene únicamente el identificador del usuario y el tipo
   * de token. La configuración de expiración, emisor, audiencia y secreto
   * se obtiene desde `envConfig`.
   *
   * @param {number} userId Identificador único del usuario autenticado.
   *
   * @returns {string}
   * Token JWT firmado que puede utilizarse para autenticar solicitudes.
   *
   * @security
   * El token utiliza el algoritmo `HS256` y se firma mediante
   * `ACCESS_SECRET`. Su tiempo de expiración debe mantenerse corto
   * para reducir el impacto de una posible exposición del token.
   */
  generateAccessToken(userId: number): string {
    return jwt.sign({ sub: String(userId), type: 'access' }, envConfig.JWT.ACCESS_SECRET, {
      expiresIn: envConfig.JWT.ACCESS_EXPIRES_IN,
      issuer: envConfig.JWT.ISSUER,
      audience: envConfig.JWT.AUDIENCE,
      algorithm: 'HS256',
    } as SignOptions);
  }
}

/**
 * Instancia única del servicio de tokens utilizada por la aplicación.
 *
 * @constant
 * @type {TokenService}
 */
export default new TokenService();
