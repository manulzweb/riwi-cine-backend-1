// app/src/models/bonus-wallet.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface BonusWalletAttributes {
  id: number;
  userId: number;
  balance: number;
}

export type BonusWalletCreationAttributes = Optional<BonusWalletAttributes, 'id' | 'balance'>;

class BonusWallet
  extends Model<BonusWalletAttributes, BonusWalletCreationAttributes>
  implements BonusWalletAttributes
{
  declare public id: number;
  declare public userId: number;
  declare public balance: number;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

BonusWallet.init(
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
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'BonusWallet',
    tableName: 'bonus_wallets',
    timestamps: true,
    underscored: true,
  },
);

export default BonusWallet;
