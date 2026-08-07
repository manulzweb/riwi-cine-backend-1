import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface DepartmentAttributes {
  id: number;
  name: string;
  countryId: number;
}

export interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id"> {}

class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public countryId!: number;
}

Department.init(
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
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Department",
    tableName: "departments",
    timestamps: false,
  }
);

export default Department;
