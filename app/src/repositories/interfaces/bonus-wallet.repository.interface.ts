// app/src/repositories/interfaces/bonus-wallet.repository.interface.ts

/**
 * Contrato del repositorio de billeteras de bonos.
 *
 * Encapsula el acceso y persistencia de la entidad BonusWallet.
 */
import BonusWallet, { BonusWalletCreationAttributes } from '../../models/bonus-wallet.model';

export interface IBonusWalletRepository {
  /** Crea la billetera de bonos del usuario. */
  create(data: BonusWalletCreationAttributes): Promise<BonusWallet>;

  /** Busca la billetera asociada a un usuario. */
  findByUserId(userId: number): Promise<BonusWallet | null>;
}
