// app/src/repositories/password-reset-token.repository.ts

import { Transaction } from 'sequelize';
import {
  PasswordResetTokenCreationAttributes,
  PasswordResetTokenInstance,
} from '../models/password-reset-token.model.js';
import PasswordResetToken from '../models/password-reset-token.model.js';
import { IPasswordResetTokenRepository } from './interfaces/password-reset-token.repository.interface.js';

/**
 * Repositorio de Tokens de Restablecimiento de Contraseña
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad PasswordResetToken.
 */
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
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

export default PasswordResetTokenRepository;
