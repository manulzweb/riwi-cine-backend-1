import { Transaction } from 'sequelize';
import PurchaseHistory, {
  PurchaseHistoryCreationAttributes,
} from '../models/purchase-history.model';
import { IPurchaseHistoryRepository } from './interfaces/purchase-history.repository.interface';

class PurchaseHistoryRepository implements IPurchaseHistoryRepository {
  async create(
    data: PurchaseHistoryCreationAttributes,
    transaction?: Transaction,
  ): Promise<PurchaseHistory> {
    return await PurchaseHistory.create(data, { transaction });
  }

  async findByUserId(userId: number): Promise<PurchaseHistory | null> {
    return await PurchaseHistory.findOne({ where: { userId } });
  }
}

export default new PurchaseHistoryRepository();
