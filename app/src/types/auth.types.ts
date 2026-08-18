/**
 * Payload del token JWT de acceso
 *
 * Contiene la información del usuario que será codificada en el JWT.
 * Los campos `iat` y `exp` son añadidos automáticamente por la librería `jsonwebtoken`.
 */
export interface AccessTokenPayload {
  /** Identificador único del usuario */
  sub: string;

  /** ID del usuario */
  userId: number;

  /** Email del usuario */
  email: string;

  /** Fecha de emisión (added by jwt library) */
  iat?: number;

  /** Fecha de expiración (added by jwt library) */
  exp?: number;

  /** Emisor del token */
  iss?: string;

  /** Audiencia del token */
  aud?: string;
}
