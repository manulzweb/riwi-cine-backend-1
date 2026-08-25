import { NextFunction, Request, Response } from 'express';
import tokenService from '../services/auth-token.service';

/**
 * Middleware de autenticación con control de roles (desarrollado en develop).
 *
 * Valida el token JWT de acceso enviado en el header Authorization con el
 * formato "Bearer <token>", verifica su tipo y, opcionalmente, restringe el
 * acceso a los roles indicados. Expone el payload decodificado en `req.user`.
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

/**
 * Middleware de autenticación para los endpoints del carrito (HU-011).
 *
 * Valida el token JWT de acceso enviado en el header Authorization con el
 * formato "Bearer <token>" y expone el identificador del usuario en
 * `req.userId` para su uso en los controladores.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = tokenService.extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
    return;
  }

  const payload = tokenService.verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
    return;
  }

  req.userId = Number(payload.sub);
  next();
};
