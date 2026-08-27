// app/src/repositories/refresh-token.repository.ts

import { Transaction } from 'sequelize';
import RefreshToken, { RefreshTokenCreationAttributes } from '../models/refresh-token.model.js';

/**
 * Repositorio de Tokens de Refresco
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad RefreshToken.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class RefreshTokenRepository {
  /**
   * Crea un nuevo token de refresco.
   */
  async create(
    data: RefreshTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<RefreshToken> {
    return await RefreshToken.create(data, { transaction });
  }

  /**
   * Busca un token de refresco por su hash.
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return await RefreshToken.findOne({ where: { tokenHash } });
  }

  /**
   * Revoca todos los tokens de refresco activos de un usuario.
   */
  async revokeAllByUserId(userId: number, transaction?: Transaction): Promise<void> {
    await RefreshToken.update({ isRevoked: true }, { where: { userId }, transaction });
  }

  /**
   * Revoca un token de refresco por su identificador.
   */
  async revoke(id: number): Promise<void> {
    await RefreshToken.update({ isRevoked: true }, { where: { id } });
  }
}

export default new RefreshTokenRepository();
