// app/src/utils/crypto.util.ts

import crypto from 'node:crypto';

export const generateSecureRandomNumber = (min: number, max: number): number => {
  return crypto.randomInt(min, max + 1);
};

/**
 * Genera un código de membresía con el formato `MC-XXXXXX-XXXXXX`.
 *
 * Los números se obtienen de `crypto.randomBytes`, por lo que el código
 * no es predecible. La unicidad final la garantiza el constraint único
 * de la columna `code` en la tabla de membresías.
 */
export const generateMembershipCode = (): string =>
  'MC-' +
  generateSecureRandomNumber(100000, 999999) +
  '-' +
  generateSecureRandomNumber(100000, 999999);
