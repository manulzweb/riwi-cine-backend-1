// app/src/models/membership-level.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface MembershipLevelAttributes {
  id: number;
  name: string;
  description: string | null;
  discountPercentage: number;
}

export type MembershipLevelCreationAttributes = Optional<
  MembershipLevelAttributes,
  'id' | 'description' | 'discountPercentage'
>;

class MembershipLevel
  extends Model<MembershipLevelAttributes, MembershipLevelCreationAttributes>
  implements MembershipLevelAttributes
{
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare discountPercentage: number;
}

MembershipLevel.init(
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
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_percentage',
    },
  },
  {
    sequelize,
    modelName: 'MembershipLevel',
    tableName: 'membership_levels',
    timestamps: false,
    underscored: true,
  },
);

export default MembershipLevel;
