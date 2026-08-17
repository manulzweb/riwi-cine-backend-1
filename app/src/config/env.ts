import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const envConfig = {
  PORT: Number(process.env.APP_PORT ?? 3000),

  NODE_ENV: process.env.NODE_ENV ?? 'development',

  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') ?? [],

  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  DB: {
    HOST: required('DB_CONTAINER_NAME'),
    PORT: Number(process.env.POSTGRES_PORT ?? 5432),
    USER: required('POSTGRES_USER'),
    PASSWORD: required('POSTGRES_PASSWORD'),
    NAME: required('POSTGRES_DB'),
  },

  JWT: {
    ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
    REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  LOGIN: {
    MAX_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS ?? 5),
    LOCK_TIME_MINUTES: Number(process.env.LOCK_TIME_MINUTES ?? 15),
  },

  RATE_LIMIT: {
    WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
    MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  },

  REGISTER: {
    WINDOW_MS: Number(process.env.REGISTER_LIMIT_WINDOW_MS ?? 900000),
    MAX_REQUESTS: Number(process.env.REGISTER_LIMIT_MAX_REQUESTS ?? 10),
    MESSAGE:
      process.env.REGISTER_LIMIT_MESSAGE ??
      'Demasiadas solicitudes de registro. Por favor intente más tarde.',
    ACTIVATION_TOKEN_EXPIRE_HOURS: Number(process.env.ACTIVATION_TOKEN_EXPIRE_HOURS ?? 24),
  },

  SMTP: {
    HOST: required('SMTP_HOST'),
    PORT: Number(process.env.SMTP_PORT ?? 2525),
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: required('SMTP_USER'),
    PASS: required('SMTP_PASS'),
    FROM: required('SMTP_FROM'),
  },
};
