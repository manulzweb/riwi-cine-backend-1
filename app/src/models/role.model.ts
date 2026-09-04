// app/src/models/role.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface RoleAttributes {
  id: number;
  name: string;
  description?: string | null;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: number;
  declare name: string;
  declare description: string | null;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false,
  },
);

export default Role;
