// app/src/repositories/interfaces/profile.repository.interface.ts

import { Transaction } from 'sequelize';
import Profile, { ProfileCreationAttributes } from '../../models/profile.model.js';

export interface IProfileRepository {
  create(data: ProfileCreationAttributes, transaction?: Transaction): Promise<Profile>;
  findByUserId(userId: number): Promise<Profile | null>;
  update(
    id: number,
    newData: Partial<ProfileCreationAttributes>,
    transaction?: Transaction,
  ): Promise<Profile | null>;
}
