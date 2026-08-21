/**
 * Contrato del repositorio de historiales de compras.
 *
 * Encapsula el acceso y persistencia de la entidad PurchaseHistory.
 */
import PurchaseHistory, {
  PurchaseHistoryCreationAttributes,
} from '../../models/purchase-history.model';
import { Transaction } from 'sequelize';

export interface IPurchaseHistoryRepository {
  /** Crea el historial de compras del usuario. */
  create(
    data: PurchaseHistoryCreationAttributes,
    transaction?: Transaction,
  ): Promise<PurchaseHistory>;

  /** Busca el historial asociado a un usuario. */
  findByUserId(userId: number): Promise<PurchaseHistory | null>;
}
