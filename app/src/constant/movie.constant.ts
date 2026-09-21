// app/src/constant/movie.constant.ts

export const MOVIE_LIMITS = {
  RECOMMENDATIONS_LIMIT: 6,
  BILLBOARD_DAYS: 7,
} as const;

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const MOVIE_FORMATS = {
  TWO_D: '2D',
  THREE_D: '3D',
  IMAX: 'IMAX',
  VIP: 'VIP',
} as const;

export const MOVIE_CLASSIFICATIONS = {
  G: 'G',
  PG: 'PG',
  PG_13: 'PG-13',
  R: 'R',
} as const;
