import { Transaction } from 'sequelize';
import RefreshToken, { RefreshTokenCreationAttributes } from '../models/refresh-token.model';

class RefreshTokenRepository {
  async create(
    data: RefreshTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<RefreshToken> {
    return await RefreshToken.create(data, { transaction });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return await RefreshToken.findOne({ where: { tokenHash } });
  }

  async revokeAllByUserId(userId: number, transaction?: Transaction): Promise<void> {
    await RefreshToken.update({ isRevoked: true }, { where: { userId }, transaction });
  }

  async revoke(id: number): Promise<void> {
    await RefreshToken.update({ isRevoked: true }, { where: { id } });
  }
}

export default new RefreshTokenRepository();
