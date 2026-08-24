// app/src/constant/auth.constant.ts

export const AUTH_LIMITS = {
  MIN_PASSWORD_LENGTH: 10,
  MAX_PASSWORD_LENGTH: 128,
  MAX_EMAIL_LENGTH: 254,
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
