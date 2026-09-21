// app/src/types/auth.types.ts

/**
 * Payload del token JWT de acceso
 *
 * Contiene la información del usuario que será codificada en el JWT.
 * Los campos `iat` y `exp` son añadidos automáticamente por la librería `jsonwebtoken`.
 */
export interface AccessTokenPayload {
  /** Identificador único del usuario */
  sub: string;

  /** Rol del usuario */
  role: number;

  /** Tipo de token */
  type: 'access';

  /** Fecha de emisión (añadida por la librería jwt) */
  iat?: number;

  /** Fecha de expiración (añadida por la librería jwt) */
  exp?: number;
}

/**
 * Payload del token JWT de refresco
 *
 * Contiene información mínima para renovar el token de acceso.
 * Los campos `iat` y `exp` son añadidos automáticamente por la librería `jsonwebtoken`.
 */
export interface RefreshTokenPayload {
  /** Identificador único del usuario */
  sub: string;

  /** Tipo de token */
  type: 'refresh';

  /** Fecha de emisión (añadida por la librería jwt) */
  iat?: number;

  /** Fecha de expiración (añadida por la librería jwt) */
  exp?: number;
}
