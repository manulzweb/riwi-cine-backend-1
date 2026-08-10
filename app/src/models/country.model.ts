import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface CountryAttributes {
  id: number;
  name: string;
}

export interface CountryCreationAttributes extends Optional<CountryAttributes, "id"> {}

class Country extends Model<CountryAttributes, CountryCreationAttributes> implements CountryAttributes {
  public id!: number;
  public name!: string;
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
  },
  {
    sequelize,
    modelName: "Country",
    tableName: "countries",
    timestamps: false,
  }
);

export default Country;
