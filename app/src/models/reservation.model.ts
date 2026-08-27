// app/src/models/reservation.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import CinemaFunction from './function.model.js';

export type ReservationStatus = 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CONFIRMED';

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
  public id!: number;
  public userId!: number;
  public functionId!: number;
  public status!: ReservationStatus;
  public expiresAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'RELEASED', 'CONFIRMED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
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
