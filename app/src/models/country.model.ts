// app/src/models/country.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface CountryAttributes {
  id: number;
  name: string;
  isActive: boolean;
}

export type CountryCreationAttributes = Optional<CountryAttributes, 'id'>;

class Country
  extends Model<CountryAttributes, CountryCreationAttributes>
  implements CountryAttributes
{
  public id!: number;
  public name!: string;
  public isActive!: boolean;
}

Country.init(
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    timestamps: true,
  },
);

export default Country;
