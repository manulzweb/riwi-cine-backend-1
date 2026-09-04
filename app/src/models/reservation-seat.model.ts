// app/src/models/reservation-seat.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type ReservationSeatStatus = 'LOCKED' | 'RELEASED' | 'SOLD';

export interface ReservationSeatAttributes {
  id: number;
  reservationId: number;
  seatId: number;
  status: ReservationSeatStatus;
  price: number;
}

export type ReservationSeatCreationAttributes = Optional<
  ReservationSeatAttributes,
  'id' | 'status'
>;
class ReservationSeat
  extends Model<ReservationSeatAttributes, ReservationSeatCreationAttributes>
  implements ReservationSeatAttributes
{
  declare id: number;
  declare reservationId: number;
  declare seatId: number;
  declare status: ReservationSeatStatus;
  declare price: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ReservationSeat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reservation_id',
    },
    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'seat_id',
    },
    status: {
      type: DataTypes.ENUM('LOCKED', 'RELEASED', 'SOLD'),
      allowNull: false,
      defaultValue: 'LOCKED',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ReservationSeat',
    tableName: 'reservation_seats',
    timestamps: true,
  },
);

export default ReservationSeat;
