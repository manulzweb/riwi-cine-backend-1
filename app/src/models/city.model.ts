// app/src/models/city.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CityAttributes {
  id: number;
  name: string;
  departmentId: number;
  isActive: boolean;
}

export type CityCreationAttributes = Optional<CityAttributes, 'id'>;

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  declare public id: number;
  declare public name: string;
  declare public departmentId: number;
  declare public isActive: boolean;
}

City.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: false,
  },
);

export default City;
