import { Transaction } from 'sequelize';
import MembershipStatus, {
  MembershipStatusCreationAttributes,
} from '../models/membership-status.model';
import { IMembershipStatusRepository } from './interfaces/membership-status.repository.interface';

class MembershipStatusRepository implements IMembershipStatusRepository {
  async create(
    data: MembershipStatusCreationAttributes,
    transaction?: Transaction,
  ): Promise<MembershipStatus> {
    return await MembershipStatus.create(data, { transaction });
  }

  async findById(id: number): Promise<MembershipStatus | null> {
    return await MembershipStatus.findByPk(id);
  }

  async findByName(name: string): Promise<MembershipStatus | null> {
    return await MembershipStatus.findOne({ where: { name } });
  }
}

export default new MembershipStatusRepository();
