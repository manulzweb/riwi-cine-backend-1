// app/src/__tests__/auth-token.service.test.ts

import jwt from 'jsonwebtoken';
import { TokenService } from '../services/auth-token.service.js';
import { envConfig } from '../config/env.js';

describe('TokenService (Autenticación y Tokens JWT)', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  describe('generateAccessToken', () => {
    it('debe incluir sub, role y type: "access" en el payload', () => {
      const userId = 101;
      const roleId = 2;

      const token = tokenService.generateAccessToken(userId, roleId);
      const decoded = jwt.decode(token) as { sub: string; role: number; type: string };

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe('101');
      expect(decoded.role).toBe(2);
      expect(decoded.type).toBe('access');
    });

    it('debe asignar el rol por defecto (1) si no se especifica roleId', () => {
      const userId = 202;

      const token = tokenService.generateAccessToken(userId);
      const decoded = jwt.decode(token) as { sub: string; role: number; type: string };

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe('202');
      expect(decoded.role).toBe(1);
      expect(decoded.type).toBe('access');
    });

    it('debe incluir claims estándar de emisor y audiencia definidos en envConfig', () => {
      const token = tokenService.generateAccessToken(50);
      const decoded = jwt.decode(token) as { iss: string; aud: string };

      expect(decoded.iss).toBe(envConfig.JWT.ISSUER);
      expect(decoded.aud).toBe(envConfig.JWT.AUDIENCE);
    });
  });

  describe('verifyAccessToken', () => {
    it('debe decodificar correctamente el payload con rol para un token válido', () => {
      const userId = 303;
      const roleId = 3;

      const token = tokenService.generateAccessToken(userId, roleId);
      const payload = tokenService.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('303');
      expect(payload?.role).toBe(3);
      expect(payload?.type).toBe('access');
    });

    it('debe rechazar un token expirado retornando null', () => {
      const expiredToken = jwt.sign(
        { sub: '101', role: 1, type: 'access' },
        envConfig.JWT.ACCESS_SECRET,
        {
          expiresIn: '-5s',
          issuer: envConfig.JWT.ISSUER,
          audience: envConfig.JWT.AUDIENCE,
          algorithm: 'HS256',
        },
      );

      const payload = tokenService.verifyAccessToken(expiredToken);
      expect(payload).toBeNull();
    });

    it('debe rechazar un token con firma inválida retornando null', () => {
      const tokenWithWrongSecret = jwt.sign(
        { sub: '101', role: 1, type: 'access' },
        'clave-secreta-totalmente-diferente',
        {
          expiresIn: '15m',
          issuer: envConfig.JWT.ISSUER,
          audience: envConfig.JWT.AUDIENCE,
          algorithm: 'HS256',
        },
      );

      const payload = tokenService.verifyAccessToken(tokenWithWrongSecret);
      expect(payload).toBeNull();
    });

    it('debe rechazar un token alterado o corrupto retornando null', () => {
      const validToken = tokenService.generateAccessToken(101, 1);
      const corruptedToken = validToken.slice(0, -6) + 'xxxxxx';

      const payload = tokenService.verifyAccessToken(corruptedToken);
      expect(payload).toBeNull();
    });

    it('debe rechazar strings que no son tokens JWT', () => {
      expect(tokenService.verifyAccessToken('invalid.token.string')).toBeNull();
      expect(tokenService.verifyAccessToken('')).toBeNull();
    });
  });

  describe('generateRefreshToken & verifyRefreshToken', () => {
    it('debe generar un refresh token con sub y type: "refresh"', () => {
      const userId = 404;

      const token = tokenService.generateRefreshToken(userId);
      const decoded = jwt.decode(token) as { sub: string; type: string };

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe('404');
      expect(decoded.type).toBe('refresh');
    });

    it('debe verificar correctamente un refresh token válido', () => {
      const userId = 505;

      const token = tokenService.generateRefreshToken(userId);
      const payload = tokenService.verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('505');
      expect(payload?.type).toBe('refresh');
    });

    it('debe rechazar un access token usado como refresh token', () => {
      const accessToken = tokenService.generateAccessToken(606, 1);
      const payload = tokenService.verifyRefreshToken(accessToken);

      expect(payload).toBeNull();
    });

    it('debe rechazar un refresh token con firma inválida o expirado', () => {
      const invalidToken = jwt.sign({ sub: '707', type: 'refresh' }, 'otro-secreto-falso');

      expect(tokenService.verifyRefreshToken(invalidToken)).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('debe extraer el token del formato "Bearer <token>"', () => {
      const rawToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.firm';
      const authHeader = `Bearer ${rawToken}`;

      const extracted = tokenService.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(rawToken);
    });

    it('debe tolerar espacios adicionales en el header Bearer', () => {
      const rawToken = 'token.con.espacios';
      const authHeader = `  Bearer   ${rawToken}  `;

      const extracted = tokenService.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(rawToken);
    });

    it('debe retornar null si no se envía header de autorización', () => {
      expect(tokenService.extractTokenFromHeader(undefined)).toBeNull();
      expect(tokenService.extractTokenFromHeader('')).toBeNull();
    });

    it('debe retornar null si el esquema no es Bearer', () => {
      expect(tokenService.extractTokenFromHeader('Basic dXNlcjpwYXNz')).toBeNull();
      expect(tokenService.extractTokenFromHeader('Token abc123xyz')).toBeNull();
    });

    it('debe retornar null si sólo viene "Bearer" sin token', () => {
      expect(tokenService.extractTokenFromHeader('Bearer')).toBeNull();
      expect(tokenService.extractTokenFromHeader('Bearer   ')).toBeNull();
    });
  });

  describe('decodeToken & isTokenExpired', () => {
    it('decodeToken debe decodificar un token válido sin verificar firma', () => {
      const token = tokenService.generateAccessToken(888, 2);
      const decoded = tokenService.decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('888');
      expect(decoded?.role).toBe(2);
    });

    it('decodeToken debe retornar null para texto inválido', () => {
      expect(tokenService.decodeToken('no-es-un-jwt')).toBeNull();
    });

    it('isTokenExpired debe retornar false para un token recién generado', () => {
      const token = tokenService.generateAccessToken(999, 1);
      expect(tokenService.isTokenExpired(token)).toBe(false);
    });

    it('isTokenExpired debe retornar true para un token con fecha de expiración pasada', () => {
      const expiredToken = jwt.sign(
        { sub: '999', role: 1, type: 'access' },
        envConfig.JWT.ACCESS_SECRET,
        { expiresIn: '-10s' },
      );

      expect(tokenService.isTokenExpired(expiredToken)).toBe(true);
    });

    it('isTokenExpired debe retornar true para un token sin claim exp o malformado', () => {
      expect(tokenService.isTokenExpired('invalido')).toBe(true);
    });
  });
});
