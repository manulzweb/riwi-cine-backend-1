import { Transaction } from 'sequelize';
import MembershipLevel, {
  MembershipLevelCreationAttributes,
} from '../models/membership-level.model';
import { IMembershipLevelRepository } from './interfaces/membership-level.repository.interface';

class MembershipLevelRepository implements IMembershipLevelRepository {
  async create(
    data: MembershipLevelCreationAttributes,
    transaction?: Transaction,
  ): Promise<MembershipLevel> {
    return await MembershipLevel.create(data, { transaction });
  }

  async findById(id: number): Promise<MembershipLevel | null> {
    return await MembershipLevel.findByPk(id);
  }

  async findByName(name: string): Promise<MembershipLevel | null> {
    return await MembershipLevel.findOne({ where: { name } });
  }
}

export default new MembershipLevelRepository();
