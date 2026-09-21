// app/src/constant/membership.constant.ts

import { MEMBERSHIP_LEVELS } from './auth.constant.js';

export const MEMBERSHIP_DISCOUNTS = {
  [MEMBERSHIP_LEVELS.BASIC]: 0,
  [MEMBERSHIP_LEVELS.STANDARD]: 5,
  [MEMBERSHIP_LEVELS.PREMIUM]: 10,
} as const;

export const LEVEL_POINTS_REQUIREMENTS: Record<
  string,
  { nextLevel: string; points: number; discount: number }
> = {
  [MEMBERSHIP_LEVELS.BASIC]: { nextLevel: MEMBERSHIP_LEVELS.STANDARD, points: 300, discount: 5 },
  [MEMBERSHIP_LEVELS.STANDARD]: { nextLevel: MEMBERSHIP_LEVELS.PREMIUM, points: 800, discount: 10 },
  [MEMBERSHIP_LEVELS.PREMIUM]: { nextLevel: MEMBERSHIP_LEVELS.PREMIUM, points: 800, discount: 10 },
};

export const DEFAULT_MEMBERSHIP_POINTS = 100;
