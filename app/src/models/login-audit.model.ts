// app/src/models/login-audit.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LoginAuditAttributes {
  id: number;
  userId: number | null;
  emailAttempted: string;
  ipAddress: string | null;
  deviceUserAgent: string | null;
  status: string;
}

export type LoginAuditCreationAttributes = Optional<LoginAuditAttributes, 'id'>;

class LoginAudit
  extends Model<LoginAuditAttributes, LoginAuditCreationAttributes>
  implements LoginAuditAttributes
{
  declare public id: number;
  declare public userId: number | null;
  declare public emailAttempted: string;
  declare public ipAddress: string | null;
  declare public deviceUserAgent: string | null;
  declare public status: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

LoginAudit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
    },
    emailAttempted: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'email_attempted',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address',
    },
    deviceUserAgent: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'device_user_agent',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'LoginAudit',
    tableName: 'login_audits',
    timestamps: true,
    underscored: true,
  },
);

export default LoginAudit;
