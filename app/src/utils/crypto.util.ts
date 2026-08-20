import crypto from 'crypto';

export const generateSecureRandomNumber = (min: number, max: number): number => {
  const range = max - min + 1;
  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0);
  return min + (randomValue % range);
};
