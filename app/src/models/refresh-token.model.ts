// app/src/models/refresh-token.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RefreshTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
}

export type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, 'id' | 'isRevoked'>;

class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare public id: number;
  declare public userId: number;
  declare public tokenHash: string;
  declare public expiresAt: Date;
  declare public isRevoked: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

RefreshToken.init(
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
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_revoked',
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
  },
);

export default RefreshToken;
