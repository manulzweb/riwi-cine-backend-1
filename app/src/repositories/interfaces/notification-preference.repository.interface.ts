// app/src/repositories/interfaces/notification-preference.repository.interface.ts

import { Transaction } from 'sequelize';
import NotificationPreference, {
  NotificationPreferenceCreationAttributes,
} from '../../models/notification-preference.model.js';

export interface INotificationPreferenceRepository {
  create(
    data: NotificationPreferenceCreationAttributes,
    transaction?: Transaction,
  ): Promise<NotificationPreference>;
  findByUserId(userId: number, transaction?: Transaction): Promise<NotificationPreference | null>;
  updateByUserId(
    userId: number,
    data: Partial<NotificationPreferenceCreationAttributes>,
    transaction?: Transaction,
  ): Promise<NotificationPreference | null>;
}
