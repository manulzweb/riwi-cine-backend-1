// app/src/middleware/validate.middleware.ts

import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { formatZodError } from '../utils/zod-error.util.js';

/**
 * ============================================================================
 * Middleware de Validación
 * ============================================================================
 *
 * Valida `req[source]` contra un esquema Zod y reemplaza el valor por
 * `parsed.data` sanitizado. Centraliza el manejo de errores de validación.
 *
 * Responsabilidades:
 *  - Ejecutar `schema.safeParse(req[source])`.
 *  - Responder 400 con `{error, details}` formateado vía `formatZodError`.
 *  - Reemplazar `req[source]` por datos validados y llamar `next()`.
 *
 * Este middleware NO debe:
 *  - Contener reglas de negocio.
 *  - Acceder a la base de datos.
 *
 * @param {ZodSchema} schema - Esquema Zod del DTO (ej: registerUserSchema)
 * @param {RequestSource} source - Origen a validar: body | params | query
 * @returns {(req: Request, res: Response, next: NextFunction) => void}
 *
 * @throws {400} Zod validation error con detalles
 */

type RequestSource = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, source: RequestSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      const { error, details } = formatZodError(parsed.error);
      res.status(400).json({ error, details });
      return;
    }

    req[source] = parsed.data;
    next();
  };
};
