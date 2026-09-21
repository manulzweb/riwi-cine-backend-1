// app/src/constant/cart.constant.ts

export const CART_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CONVERTED: 'CONVERTED',
} as const;

export const CART_LIMITS = {
  DEFAULT_EXPIRY_MINUTES: 10,
  DEFAULT_TAX_RATE: 0.19,
} as const;
