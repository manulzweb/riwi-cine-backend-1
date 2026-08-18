import jwt, { type SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env';
import type { RefreshTokenPayload } from '../types/auth.types';

const baseOptions = {
  issuer: envConfig.JWT_ISSUER,
  audience: envConfig.JWT_AUDIENCE,
} as const;

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, {
    ...baseOptions,
    expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, envConfig.JWT_REFRESH_SECRET, {
      ...baseOptions,
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') return null;

    return decoded;
  } catch {
    return null;
  }
};
