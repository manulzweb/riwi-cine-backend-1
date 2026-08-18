import { Transaction } from 'sequelize';
import Profile, { ProfileCreationAttributes } from '../models/profile.model';
import { IProfileRepository } from './interfaces/profile.repository.interface';

class ProfileRepository implements IProfileRepository {
  async create(data: ProfileCreationAttributes, transaction?: Transaction): Promise<Profile> {
    return await Profile.create(data, { transaction });
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    return await Profile.findOne({ where: { userId } });
  }
}

export default new ProfileRepository();
