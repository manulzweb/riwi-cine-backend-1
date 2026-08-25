// app/src/config/env.ts

import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const parseExpiresToMs = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value.trim());

  if (!match) {
    throw new Error(
      `Invalid expiration format: "${value}". Use a number followed by s, m, h, or d (e.g., "7d", "15m").`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const isTruthy = (value: string | undefined): boolean => {
  return value === 'true';
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
    ISSUER: process.env.JWT_ISSUER ?? 'express-typescript-auth',
    AUDIENCE: process.env.JWT_AUDIENCE ?? 'auth-client',
    ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
    REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  BCRYPT: {
    ROUNDS: Number(process.env.BCRYPT_ROUNDS ?? 12),
  },

  CART: {
    EXPIRY_MINUTES: Number(process.env.CART_EXPIRY_MINUTES ?? 10),
    TAX_RATE: Number(process.env.CART_TAX_RATE ?? 0.19),
    COMBINE_PROMOTIONS: process.env.CART_COMBINE_PROMOTIONS === 'true',
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

  COOKIE: {
    MAXAGE: parseExpiresToMs(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
  },
  RECAPTCHA: {
    ENABLED: process.env.NODE_ENV !== 'test' && isTruthy(process.env.RECAPTCHA_ENABLED),
    SITE_KEY: process.env.RECAPTCHA_SITE_KEY ?? '',
    SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ?? '',
    TIMEOUT_MS: Number(process.env.RECAPTCHA_TIMEOUT_MS ?? 5000),
    VERIFY_URL: 'https://www.google.com/recaptcha/api/siteverify',
  },
};
