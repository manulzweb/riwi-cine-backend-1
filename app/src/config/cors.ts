import { CorsOptions } from 'cors';

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Origen no permitido'));
  },
  credentials: true,
};
