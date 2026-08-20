import { Transaction } from 'sequelize';
import NotificationPreference, {
  NotificationPreferenceCreationAttributes,
} from '../models/notification-preference.model';
import { INotificationPreferenceRepository } from './interfaces/notification-preference.repository.interface';

class NotificationPreferenceRepository implements INotificationPreferenceRepository {
  async create(
    data: NotificationPreferenceCreationAttributes,
    transaction?: Transaction,
  ): Promise<NotificationPreference> {
    return await NotificationPreference.create(data, { transaction });
  }

  async findByUserId(userId: number): Promise<NotificationPreference | null> {
    return await NotificationPreference.findOne({ where: { userId } });
  }
}

export default new NotificationPreferenceRepository();
