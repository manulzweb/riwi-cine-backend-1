import { Transaction } from 'sequelize';
import PasswordResetToken, {
  PasswordResetTokenCreationAttributes,
  PasswordResetTokenInstance,
} from '../models/password-reset-token.model';

class PasswordResetTokenRepository {
  async create(
    data: PasswordResetTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<PasswordResetTokenInstance> {
    return await PasswordResetToken.create(data, { transaction });
  }

  async findLatestUnusedByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<PasswordResetTokenInstance | null> {
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
