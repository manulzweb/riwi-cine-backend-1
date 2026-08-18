import { Transaction } from 'sequelize';
import PasswordResetToken, {
  PasswordResetTokenCreationAttributes,
} from '../models/password-reset-token.model';

class PasswordResetTokenRepository {
  async create(
    data: PasswordResetTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<PasswordResetToken> {
    return await PasswordResetToken.create(data, { transaction });
  }

  async findLatestUnusedByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<PasswordResetToken | null> {
    return await PasswordResetToken.findOne({
      where: { userId, usedAt: null },
      order: [['createdAt', 'DESC']],
      transaction,
    });
  }

  async markAsUsed(id: number, transaction?: Transaction): Promise<void> {
    await PasswordResetToken.update({ usedAt: new Date() }, { where: { id }, transaction });
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
export default passwordResetTokenRepository;
