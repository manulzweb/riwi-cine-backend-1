// app/src/models/notification-preference.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface NotificationPreferenceAttributes {
  id: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface NotificationPreferenceCreationAttributes
  extends Optional<NotificationPreferenceAttributes, 'id' | 'emailEnabled' | 'smsEnabled' | 'pushEnabled'> {}

class NotificationPreference
  extends Model<NotificationPreferenceAttributes, NotificationPreferenceCreationAttributes>
  implements NotificationPreferenceAttributes
{
  public id!: number;
  public userId!: number;
  public emailEnabled!: boolean;
  public smsEnabled!: boolean;
  public pushEnabled!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
