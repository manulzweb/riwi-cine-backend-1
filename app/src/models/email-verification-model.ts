import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EmailVerificationTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
}

export type EmailVerificationTokenCreationAttributes = Optional<
  EmailVerificationTokenAttributes,
  'id' | 'usedAt'
>;

class EmailVerificationToken
  extends Model<EmailVerificationTokenAttributes, EmailVerificationTokenCreationAttributes>
  implements EmailVerificationTokenAttributes
{
  public id!: number;
  public userId!: number;
  public tokenHash!: string;
  public expiresAt!: Date;
  public usedAt?: Date | null;

  public readonly createdAt!: Date;
}

EmailVerificationToken.init(
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
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'token_hash',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'used_at',
    },
  },
  {
    sequelize,
    modelName: 'EmailVerificationToken',
    tableName: 'email_verification_tokens',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

export default EmailVerificationToken;
