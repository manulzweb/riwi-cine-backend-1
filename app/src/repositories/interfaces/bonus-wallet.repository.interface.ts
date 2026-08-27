// app/src/repositories/interfaces/bonus-wallet.repository.interface.ts

/**
 * Contrato del repositorio de billeteras de bonos.
 *
 * Encapsula el acceso y persistencia de la entidad BonusWallet.
 */
import { Transaction } from 'sequelize';
import BonusWallet, { BonusWalletCreationAttributes } from '../../models/bonus-wallet.model.js';

export interface IBonusWalletRepository {
  /** Crea la billetera de bonos del usuario. */
  create(data: BonusWalletCreationAttributes): Promise<BonusWallet>;

  /** Busca la billetera asociada a un usuario. */
  findByUserId(userId: number, transaction?: Transaction): Promise<BonusWallet | null>;

  /** Decrementa el saldo de la billetera de forma transaccional. */
  decrementBalance(userId: number, amount: number, transaction?: Transaction): Promise<void>;
}
