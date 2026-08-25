// app/src/types/express.d.ts

import 'express';
import type { AccessTokenPayload } from './auth.types';

/**
 * Ampliación de tipos de Express para exponer el usuario autenticado
 * en las solicitudes protegidas por `requireAuth` y `authMiddleware`.
 */
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    user?: AccessTokenPayload;
  }
}
