// app/src/models/membership-status.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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
  declare public id: number;
  declare public name: string;
  declare public description: string | null;
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
