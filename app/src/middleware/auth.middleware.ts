// app/src/middleware/auth.middleware.ts

import { NextFunction, Request, Response } from 'express';
import tokenService from '../services/auth-token.service';

/**
 * ============================================================================
 * Middleware de Autenticación
 * ============================================================================
 *
 * Valida el header Authorization Bearer y el access token JWT. Inyecta
 * `req.user` con el payload decodificado para uso posterior en
 * controladores y políticas de autorización.
 *
 * Responsabilidades:
 *  - Extraer token del header Authorization.
 *  - Verificar firma, expiración, issuer/audience y claim `type: access`.
 *  - Validar roles permitidos (RBAC) cuando se proporcionan.
 *  - Inyectar `req.user` y delegar a `next()`.
 *
 * Este middleware NO debe:
 *  - Acceder a la base de datos.
 *  - Generar o renovar tokens.
 *  - Contener reglas de negocio de dominio.
 *
 * @param {number[]} allowedRoles - Roles permitidos (vacío = cualquier autenticado)
 * @returns {(req: Request, res: Response, next: NextFunction) => void}
 * Middleware Express que rechaza con 401 si falta/inválido y 403 si rol no autorizado.
 *
 * @throws {401} Authorization Bearer token is required / Invalid or expired access token
 * @throws {403} Access denied (rol no permitido)
 */

export const authMiddleware = (allowedRoles: number[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = tokenService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        message: 'Authorization Bearer token is required',
      });
      return;
    }

    const decoded = tokenService.verifyAccessToken(token);

    if (decoded?.type !== 'access') {
      res.status(401).json({
        message: 'Invalid or expired access token',
      });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      res.status(403).json({
        message: 'Access denied',
      });
      return;
    }

    req.user = decoded;
    next();
  };
};
