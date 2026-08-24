import jwt, { type SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.types';
import { ITokenService } from './interfaces/token.service.interface';

/**
 * Servicio encargado de generar y verificar tokens JWT de acceso.
 *
 * Responsabilidades:
 * - Generar tokens JWT de corta duración.
 * - Verificar y decodificar tokens JWT.
 * - Extraer tokens del header Authorization.
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

  /**
   * Genera un token JWT de refresco para el usuario autenticado.
   *
   * El token contiene únicamente el identificador del usuario y el tipo
   * de token (`refresh`). La configuración de expiración, emisor,
   * audiencia y secreto se obtiene desde `envConfig`.
   *
   * @param {number} userId Identificador único del usuario autenticado.
   *
   * @returns {string}
   * Token JWT firmado que puede utilizarse para obtener nuevos
   * tokens de acceso.
   *
   * @security
   * El token utiliza el algoritmo `HS256` y se firma mediante
   * `REFRESH_SECRET`, distinto del secreto de acceso. Su tiempo de
   * vida es mayor que el del access token y nunca debe exponerse en
   * almacenamientos accesibles a terceros.
   */
  generateRefreshToken(userId: number): string {
    return jwt.sign({ sub: String(userId), type: 'refresh' }, envConfig.JWT.REFRESH_SECRET, {
      expiresIn: envConfig.JWT.REFRESH_EXPIRES_IN,
      issuer: envConfig.JWT.ISSUER,
      audience: envConfig.JWT.AUDIENCE,
      algorithm: 'HS256',
    } as SignOptions);
  }

  /**
   * Verifica y decodifica un token JWT de acceso.
   *
   * La verificación incluye firma, emisor, audiencia y algoritmo.
   * Cualquier fallo se traduce en un retorno `null` para que el
   * llamador decida cómo rechazar la solicitud.
   *
   * @param {string} token
   * Token JWT a verificar.
   *
   * @returns {AccessTokenPayload | null}
   * Payload del token si es válido; `null` si es inválido o está expirado.
   */
  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, envConfig.JWT.ACCESS_SECRET, {
        issuer: envConfig.JWT.ISSUER,
        audience: envConfig.JWT.AUDIENCE,
        algorithms: ['HS256'],
      }) as AccessTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verifica y decodifica un token JWT de refresco.
   *
   * Además de la verificación criptográfica, valida que el claim
   * `type` corresponda a un token de refresco, impidiendo que un
   * access token sea utilizado como refresh token.
   *
   * @param {string} token
   * Token JWT a verificar.
   *
   * @returns {RefreshTokenPayload | null}
   * Payload del token si es válido; `null` si es inválido, está
   * expirado o no es de tipo `refresh`.
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.JWT.REFRESH_SECRET, {
        issuer: envConfig.JWT.ISSUER,
        audience: envConfig.JWT.AUDIENCE,
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      if (decoded.type !== 'refresh') return null;

      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Extrae el token del header Authorization.
   *
   * Espera un header en formato: "Bearer <token>".
   *
   * @param {string} authHeader
   * Valor del header Authorization.
   *
   * @returns {string | null}
   * Token extraído, o `null` cuando el formato es inválido.
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Decodifica un token JWT sin verificar su firma.
   *
   * Útil para inspeccionar el contenido de un token sin validar su
   * integridad.
   *
   * @param {string} token
   * Token JWT a decodificar.
   *
   * @returns {AccessTokenPayload | null}
   * Payload decodificado, o `null` cuando el token es inválido.
   */
  decodeToken(token: string): AccessTokenPayload | null {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded !== 'object') {
      return null;
    }

    return decoded as AccessTokenPayload;
  }

  /**
   * Verifica si un token JWT está expirado.
   *
   * La comprobación se realiza sobre el claim `exp` sin verificar la
   * firma del token. Un token sin `exp` se considera expirado.
   *
   * @param {string} token
   * Token JWT a verificar.
   *
   * @returns {boolean}
   * `true` si el token está expirado; `false` en caso contrario.
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);

    if (!decoded?.exp) return true;

    return decoded.exp <= Math.floor(Date.now() / 1000);
  }
}

/**
 * Instancia única del servicio de tokens utilizada por la aplicación.
 *
 * @constant
 * @type {TokenService}
 */
const tokenService = new TokenService();
export default tokenService;
