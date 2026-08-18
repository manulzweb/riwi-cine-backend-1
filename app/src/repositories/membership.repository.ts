import { Transaction } from 'sequelize';
import Membership, { MembershipCreationAttributes } from '../models/membership.model';
import { IMembershipRepository } from './interfaces/membership.repository.interface';

class MembershipRepository implements IMembershipRepository {
  async create(data: MembershipCreationAttributes, transaction?: Transaction): Promise<Membership> {
    return await Membership.create(data, { transaction });
  }

  async findByCode(code: string, transaction?: Transaction): Promise<Membership | null> {
    return await Membership.findOne({ where: { code }, transaction });
  }

  async findByUserId(userId: number): Promise<Membership | null> {
    return await Membership.findOne({ where: { userId } });
  }
}

export default new MembershipRepository();
