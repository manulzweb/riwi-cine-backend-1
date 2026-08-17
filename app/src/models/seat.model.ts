import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SeatAttributes {
  id: number;
  roomId: number;
  seatTypeId: number;
  row: string;
  number: number;
  isAvailable: boolean;
  isActive: boolean;
}

export type SeatCreationAttributes = Optional<SeatAttributes, 'id' | 'isAvailable' | 'isActive'>;
class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
  public id!: number;
  public roomId!: number;
  public seatTypeId!: number;
  public row!: string;
  public number!: number;
  public isAvailable!: boolean;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Seat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'room_id',
    },
    seatTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'seat_type_id',
    },
    row: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_available',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Seat',
    tableName: 'seats',
    timestamps: true,
  },
);

export default Seat;
