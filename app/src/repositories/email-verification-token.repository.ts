// app/src/repositories/email-verification-token.repository.ts

import { Transaction } from 'sequelize';
import EmailVerificationToken, {
  EmailVerificationTokenCreationAttributes,
  EmailVerificationTokenInstance,
} from '../models/email-verification-token.model.js';
import { IEmailVerificationTokenRepository } from './interfaces/email-verification-token.repository.interface.js';

/**
 * Repositorio encargado de gestionar la persistencia de los
 * tokens de verificación de correo electrónico.
 */
export class EmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  async create(
    data: EmailVerificationTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<EmailVerificationTokenInstance> {
    return EmailVerificationToken.create(data, { transaction });
  }

  async findLatestUnusedByUserId(userId: number): Promise<EmailVerificationTokenInstance | null> {
    return EmailVerificationToken.findOne({
      where: {
        userId,
        usedAt: null,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async markAsUsed(tokenId: number, transaction?: Transaction): Promise<void> {
    await EmailVerificationToken.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          id: tokenId,
        },
        transaction,
      },
    );
  }

  async invalidateUnusedByUserId(userId: number): Promise<void> {
    await EmailVerificationToken.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          userId,
          usedAt: null,
        },
      },
    );
  }
}

export default EmailVerificationTokenRepository;
