// app/src/models/membership.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MembershipAttributes {
  id: number;
  userId: number;
  code: string;
  levelId: number;
  statusId: number;
  pointsBalance: number;
}

export type MembershipCreationAttributes = Optional<MembershipAttributes, 'id' | 'pointsBalance'>;

class Membership
  extends Model<MembershipAttributes, MembershipCreationAttributes>
  implements MembershipAttributes
{
  public id!: number;
  public userId!: number;
  public code!: string;
  public levelId!: number;
  public statusId!: number;
  public pointsBalance!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Membership.init(
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'level_id',
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status_id',
    },
    pointsBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'points_balance',
    },
  },
  {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: true,
    underscored: true,
  },
);

export default Membership;
