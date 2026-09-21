// app/src/constant/reservation.constant.ts

export const RESERVATION_LIMITS = {
  DURATION_MINUTES: 10,
  MAX_SEATS: 10,
} as const;

export const RESERVATION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  RELEASED: 'RELEASED',
  CONFIRMED: 'CONFIRMED',
} as const;

export const SEAT_STATES = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  LOCKED: 'LOCKED',
} as const;

export const SEAT_TYPES = {
  GENERAL: 'General',
  PREFERENCIAL: 'Preferencial',
  VIP: 'VIP',
} as const;

export const SEAT_PRICE_FACTORS = {
  [SEAT_TYPES.GENERAL]: 1.0,
  [SEAT_TYPES.PREFERENCIAL]: 1.3,
  [SEAT_TYPES.VIP]: 1.8,
} as const;
