// app/src/repositories/bonus-wallet.repository.ts

import { Transaction } from 'sequelize';
import BonusWallet, { BonusWalletCreationAttributes } from '../models/bonus-wallet.model.js';
import { IBonusWalletRepository } from './interfaces/bonus-wallet.repository.interface.js';

/**
 * Repositorio de Billeteras de Bonos
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad BonusWallet.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class BonusWalletRepository implements IBonusWalletRepository {
  /**
   * Crea una nueva billetera de bonos.
   */
  async create(
    data: BonusWalletCreationAttributes,
    transaction?: Transaction,
  ): Promise<BonusWallet> {
    return await BonusWallet.create(data, { transaction });
  }

  async findByUserId(userId: number, transaction?: Transaction): Promise<BonusWallet | null> {
    return await BonusWallet.findOne({ where: { userId }, transaction });
  }

  async decrementBalance(userId: number, amount: number, transaction?: Transaction): Promise<void> {
    await BonusWallet.decrement('balance', { by: amount, where: { userId }, transaction });
  }
}

export default new BonusWalletRepository();
