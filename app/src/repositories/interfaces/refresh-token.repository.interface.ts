// app/src/repositories/interfaces/refresh-token.repository.interface.ts

import { Transaction } from 'sequelize';
import RefreshToken, { RefreshTokenCreationAttributes } from '../../models/refresh-token.model.js';

export interface IRefreshTokenRepository {
  create(data: RefreshTokenCreationAttributes, transaction?: Transaction): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeAllByUserId(userId: number, transaction?: Transaction): Promise<void>;
  revoke(id: number): Promise<void>;
}
