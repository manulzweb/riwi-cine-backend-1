// app/src/models/seat-type.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface SeatTypeAttributes {
  id: number;
  name: string;
  description: string | null;
  priceFactor: number;
}

export type SeatTypeCreationAttributes = Optional<
  SeatTypeAttributes,
  'id' | 'description' | 'priceFactor'
>;

class SeatType
  extends Model<SeatTypeAttributes, SeatTypeCreationAttributes>
  implements SeatTypeAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public priceFactor!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SeatType.init(
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
    priceFactor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.0,
      field: 'price_factor',
    },
  },
  {
    sequelize,
    modelName: 'SeatType',
    tableName: 'seat_types',
    timestamps: true,
  },
);

export default SeatType;
