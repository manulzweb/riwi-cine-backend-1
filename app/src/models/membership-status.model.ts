// app/src/models/membership-status.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface MembershipStatusAttributes {
  id: number;
  name: string;
  description: string | null;
}

export type MembershipStatusCreationAttributes = Optional<
  MembershipStatusAttributes,
  'id' | 'description'
>;

class MembershipStatus
  extends Model<MembershipStatusAttributes, MembershipStatusCreationAttributes>
  implements MembershipStatusAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
}

MembershipStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'MembershipStatus',
    tableName: 'membership_statuses',
    timestamps: false,
    underscored: true,
  },
);

export default MembershipStatus;
