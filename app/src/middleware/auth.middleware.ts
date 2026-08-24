import { NextFunction, Request, Response } from 'express';
import tokenService from '../services/auth-token.service';

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
