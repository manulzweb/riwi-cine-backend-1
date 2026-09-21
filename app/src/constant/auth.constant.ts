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

export const ROLES = {
  CLIENT: 'cliente',
  ADMIN: 'admin',
} as const;

export const MEMBERSHIP_LEVELS = {
  BASIC: 'BÁSICA',
  STANDARD: 'ESTÁNDAR',
  PREMIUM: 'PREMIUM',
} as const;

export const MEMBERSHIP_STATUSES = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
} as const;

export const DEFAULT_USER_REGISTRATION = {
  ROLE: ROLES.CLIENT,
  MEMBERSHIP_LEVEL: MEMBERSHIP_LEVELS.BASIC,
  MEMBERSHIP_STATUS: MEMBERSHIP_STATUSES.ACTIVE,
} as const;

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export const JWT_CONFIG = {
  ALGORITHM: 'HS256',
} as const;
