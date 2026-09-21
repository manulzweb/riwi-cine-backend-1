// app/src/repositories/purchase-history.repository.ts

import { Transaction } from 'sequelize';
import PurchaseHistory, {
  PurchaseHistoryCreationAttributes,
} from '../models/purchase-history.model.js';
import { IPurchaseHistoryRepository } from './interfaces/purchase-history.repository.interface.js';

/**
 * Repositorio de Historial de Compras
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad PurchaseHistory.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
export class PurchaseHistoryRepository implements IPurchaseHistoryRepository {
  /**
   * Crea un nuevo registro en el historial de compras.
   */
  async create(
    data: PurchaseHistoryCreationAttributes,
    transaction?: Transaction,
  ): Promise<PurchaseHistory> {
    return await PurchaseHistory.create(data, { transaction });
  }

  /**
   * Busca el registro del historial de compras de un usuario.
   */
  async findByUserId(userId: number): Promise<PurchaseHistory | null> {
    return await PurchaseHistory.findOne({ where: { userId } });
  }
}

export default PurchaseHistoryRepository;
