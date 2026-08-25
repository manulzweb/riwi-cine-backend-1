// app/src/models/reservation-seat.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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
  public id!: number;
  public reservationId!: number;
  public seatId!: number;
  public status!: ReservationSeatStatus;
  public price!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
