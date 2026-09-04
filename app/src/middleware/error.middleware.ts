// app/src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/base.error.js';
import { ZodError } from 'zod';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';
import { envConfig } from '../config/env.js';

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) {
    return _next(error);
  }

  // 1) Errores de dominio operacionales → exponer al cliente
  if (error instanceof DomainError) {
    // Log 4xx como warn, 5xx como error
    if (error.status >= 500) {
      console.error(`[DomainError] ${req.method} ${req.path} -> ${error.code}:`, error);
    }
    return res.status(error.status).json({
      error: error.code,
      message: error.message,
    });
  }

  // 2) Zod (validación de DTOs) → 400
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos.',
      details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  // 3) Sequelize → 400/409
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'UNIQUE_CONSTRAINT',
      message: 'El recurso ya existe.',
      details: error.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (error instanceof SequelizeValidationError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Error de validación en base de datos.',
      details: error.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // 4) Fallback no operacional → 500, no filtrar stack en prod
  console.error(`[Unhandled] ${req.method} ${req.path}:`, error);

  const isProd = envConfig.NODE_ENV === 'production';

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isProd ? 'Ocurrió un error interno en el servidor.' : (error as Error).message,
    ...(!isProd && { stack: (error as Error).stack }),
  });
}
