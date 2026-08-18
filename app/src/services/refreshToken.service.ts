import jwt, { type SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env';
import type { RefreshTokenPayload } from '../types/auth.types';

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, envConfig.JWT.REFRESH_SECRET, {
    issuer: envConfig.JWT.ISSUER,
    audience: envConfig.JWT.AUDIENCE,
    expiresIn: envConfig.JWT.REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, envConfig.JWT.REFRESH_SECRET, {
      issuer: envConfig.JWT.ISSUER,
      audience: envConfig.JWT.AUDIENCE,
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') return null;

    return decoded;
  } catch {
    return null;
  }
};
