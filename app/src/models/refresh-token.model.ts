// app/src/models/refresh-token.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

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
  declare id: number;
  declare userId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare isRevoked: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
