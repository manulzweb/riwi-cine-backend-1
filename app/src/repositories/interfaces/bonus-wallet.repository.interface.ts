// app/src/repositories/interfaces/bonus-wallet.repository.interface.ts

import { Transaction } from 'sequelize';
import BonusWallet, { BonusWalletCreationAttributes } from '../../models/bonus-wallet.model.js';

export interface IBonusWalletRepository {
  create(data: BonusWalletCreationAttributes, transaction?: Transaction): Promise<BonusWallet>;
  findByUserId(
    userId: number,
    transaction?: Transaction,
    lock?: boolean,
  ): Promise<BonusWallet | null>;
  decrementBalance(userId: number, amount: number, transaction?: Transaction): Promise<void>;
  incrementBalance(userId: number, amount: number, transaction?: Transaction): Promise<void>;
}
