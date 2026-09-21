// app/src/models/reservation.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import CinemaFunction from './function.model.js';
import { RESERVATION_STATUS } from '../constant/index.js';

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export interface ReservationAttributes {
  id: number;
  userId: number;
  functionId: number;
  status: ReservationStatus;
  expiresAt: Date | null;
}

export type ReservationCreationAttributes = Optional<ReservationAttributes, 'id' | 'expiresAt'>;

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  declare id: number;
  declare userId: number;
  declare functionId: number;
  declare status: ReservationStatus;
  declare expiresAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    functionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'function_id',
      references: {
        model: CinemaFunction,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RESERVATION_STATUS)),
      allowNull: false,
      defaultValue: RESERVATION_STATUS.ACTIVE,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    timestamps: true,
  },
);

export default Reservation;
