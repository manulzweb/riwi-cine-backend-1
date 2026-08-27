// app/src/repositories/password-reset-token.repository.ts

import { Transaction } from 'sequelize';
import PasswordResetToken, {
  PasswordResetTokenCreationAttributes,
  PasswordResetTokenInstance,
} from '../models/password-reset-token.model.js';

/**
 * Repositorio de Tokens de Restablecimiento de Contraseña
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad PasswordResetToken.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class PasswordResetTokenRepository {
  /**
   * Crea un nuevo token de restablecimiento de contraseña.
   */
  async create(
    data: PasswordResetTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<PasswordResetTokenInstance> {
    return await PasswordResetToken.create(data, { transaction });
  }

  /**
   * Obtiene el token de restablecimiento más reciente que todavía
   * no haya sido utilizado.
   */
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

  /**
   * Marca un token de restablecimiento como utilizado,
   * impidiendo su reutilización.
   */
  async markAsUsed(id: number, transaction?: Transaction): Promise<void> {
    await PasswordResetToken.update({ usedAt: new Date() }, { where: { id }, transaction });
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
export default passwordResetTokenRepository;
