import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface BaseTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export type BaseTokenCreationAttributes = Optional<BaseTokenAttributes, 'id' | 'usedAt'>;

const baseTokenFields = {
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
    defaultValue: null,
    field: 'used_at',
  },
} as const;

export function createTokenModel(tableName: string) {
  class TokenModel
    extends Model<BaseTokenAttributes, BaseTokenCreationAttributes>
    implements BaseTokenAttributes
  {
    public id!: number;
    public userId!: number;
    public tokenHash!: string;
    public expiresAt!: Date;
    public usedAt!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  TokenModel.init(baseTokenFields, {
    sequelize,
    modelName: tableName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/ /g, ''),
    tableName,
    timestamps: true,
    underscored: true,
  });

  return TokenModel;
}
