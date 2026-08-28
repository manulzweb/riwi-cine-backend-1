// app/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/base.error';

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof DomainError) {
    return res.status(error.status).json({
      error: error.code,
      message: error.message,
    });
  }

  // Fallback para errores no controlados (base de datos caída, fallas de código, etc.)
  console.error('Unhandled error:', error);

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error interno en el servidor.',
  });
  next();
}
