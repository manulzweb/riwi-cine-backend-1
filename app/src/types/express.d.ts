// app/src/types/express.d.ts

import type { AccessTokenPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
