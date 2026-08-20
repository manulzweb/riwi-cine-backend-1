import { Transaction } from 'sequelize';
import BonusWallet, { BonusWalletCreationAttributes } from '../models/bonus-wallet.model';
import { IBonusWalletRepository } from './interfaces/bonus-wallet.repository.interface';

class BonusWalletRepository implements IBonusWalletRepository {
  async create(
    data: BonusWalletCreationAttributes,
    transaction?: Transaction,
  ): Promise<BonusWallet> {
    return await BonusWallet.create(data, { transaction });
  }

  async findByUserId(userId: number): Promise<BonusWallet | null> {
    return await BonusWallet.findOne({ where: { userId } });
  }
}

export default new BonusWalletRepository();
