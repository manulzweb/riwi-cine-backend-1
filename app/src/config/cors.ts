// app/src/config/cors.ts

import { CorsOptions } from 'cors';
import { envConfig } from './env.js';

const allowedOrigins = envConfig.CORS_ORIGINS;

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Origen no permitido'));
  },
  credentials: true,
};
