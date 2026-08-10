// app/src/models/membership-level.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MembershipLevelAttributes {
  id: number;
  name: string;
  description: string | null;
}

export interface MembershipLevelCreationAttributes extends Optional<MembershipLevelAttributes, 'id' | 'description'> {}

class MembershipLevel extends Model<MembershipLevelAttributes, MembershipLevelCreationAttributes> implements MembershipLevelAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
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
