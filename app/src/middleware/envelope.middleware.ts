// app/src/middleware/envelope.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * ============================================================================
 * Middleware de Envoltura de Respuestas (Response Envelope Pattern)
 * ============================================================================
 *
 * Intercepta todas las respuestas salientes a través de `res.json` para
 * formatearlas en una estructura estándar y uniforme:
 *
 * Éxito (HTTP 2xx):
 *  {
 *    "success": true,
 *    "message"?: string,
 *    "data"?: T
 *  }
 *
 * Error (HTTP 4xx / 5xx):
 *  {
 *    "success": false,
 *    "error"?: string,
 *    "message"?: string,
 *    "details"?: any
 *  }
 *
 * Opciones especiales:
 *  - Ignora automáticamente las rutas de documentación Swagger (/docs).
 *  - Si la respuesta ya incluye la propiedad `success`, no la re-envuelve.
 * ============================================================================
 */
export const envelopeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Ignorar rutas de Swagger docs o recursos de documentación
  if (req.originalUrl?.includes('/docs')) {
    next();
    return;
  }

  const originalJson = res.json.bind(res);

  res.json = (body: unknown): Response => {
    if (res.headersSent) {
      return originalJson(body);
    }

    // Si no es un objeto o es un Buffer, retornar sin alterar
    if (typeof body !== 'object' || body === null || Buffer.isBuffer(body)) {
      return originalJson(body);
    }

    const payload = body as Record<string, unknown>;

    // Si ya viene con 'success' explícito, no re-envolver
    if ('success' in payload) {
      return originalJson(payload);
    }

    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

    if (isSuccess) {
      let message: string | undefined;
      let data: unknown = payload;

      if (!Array.isArray(payload)) {
        if (
          'message' in payload &&
          typeof payload.message === 'string' &&
          Object.keys(payload).length === 1
        ) {
          message = payload.message;
          data = undefined;
        } else if (
          'message' in payload &&
          typeof payload.message === 'string' &&
          'data' in payload
        ) {
          message = payload.message;
          data = payload.data;
        } else if ('message' in payload && typeof payload.message === 'string') {
          const { message: msg, ...rest } = payload;
          message = msg as string;
          data = Object.keys(rest).length > 0 ? rest : undefined;
        }
      }

      const responseEnvelope: Record<string, unknown> = {
        success: true,
      };

      if (message !== undefined) {
        responseEnvelope.message = message;
      }

      if (data !== undefined) {
        responseEnvelope.data = data;
      }

      return originalJson(responseEnvelope);
    }

    // Códigos HTTP de error (4xx / 5xx)
    const errorEnvelope: Record<string, unknown> = {
      success: false,
      ...payload,
    };

    return originalJson(errorEnvelope);
  };

  next();
};

export default envelopeMiddleware;
