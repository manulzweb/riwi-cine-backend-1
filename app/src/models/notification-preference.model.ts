// app/src/models/notification-preference.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface NotificationPreferenceAttributes {
  id: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export type NotificationPreferenceCreationAttributes = Optional<
  NotificationPreferenceAttributes,
  'id' | 'emailEnabled' | 'smsEnabled' | 'pushEnabled'
>;

class NotificationPreference
  extends Model<NotificationPreferenceAttributes, NotificationPreferenceCreationAttributes>
  implements NotificationPreferenceAttributes
{
  declare id: number;
  declare userId: number;
  declare emailEnabled: boolean;
  declare smsEnabled: boolean;
  declare pushEnabled: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

NotificationPreference.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      unique: true,
    },
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'email_enabled',
    },
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'sms_enabled',
    },
    pushEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'push_enabled',
    },
  },
  {
    sequelize,
    modelName: 'NotificationPreference',
    tableName: 'notification_preferences',
    timestamps: true,
    underscored: true,
  },
);

export default NotificationPreference;
