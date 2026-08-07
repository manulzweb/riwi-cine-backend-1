import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface CinemaAttributes {
  id: number;
  name: string;
  address: string;
  cityId: number;
  isActive: boolean;
}

export interface CinemaCreationAttributes extends Optional<CinemaAttributes, "id"> {}

class Cinema extends Model<CinemaAttributes, CinemaCreationAttributes> implements CinemaAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public cityId!: number;
  public isActive!: boolean;
}

Cinema.init(
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
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    cityId: {
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
    modelName: "Cinema",
    tableName: "cinemas",
    timestamps: false,
  }
);

export default Cinema;
