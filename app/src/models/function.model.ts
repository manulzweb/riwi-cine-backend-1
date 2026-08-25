// app/src/models/function.model.ts

/**
 * Modelo de Función (Showtime)
 * -----------------------------
 * Representa una función/horario disponible para una película, en un complex/sala.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Movie from './movie.model';

export interface FunctionAttributes {
  id: number;
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
  isActive: boolean;

  // Campos de HU-004 para compatibilidad y no romper la consulta de detalle
  dateTime: Date;
  format: string; // 2D, 3D, IMAX, VIP
  room: string;
  totalSeats: number;
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FunctionCreationAttributes extends Optional<
  FunctionAttributes,
  | 'id'
  | 'active'
  | 'isActive'
  | 'roomId'
  | 'endTime'
  | 'dateTime'
  | 'format'
  | 'room'
  | 'totalSeats'
  | 'startTime'
> {}

class CinemaFunction
  extends Model<FunctionAttributes, FunctionCreationAttributes>
  implements FunctionAttributes
{
  public id!: number;
  public movieId!: number;
  public roomId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public price!: number;
  public availableSeats!: number;
  public isActive!: boolean;

  // Compatibilidad con HU-004
  public dateTime!: Date;
  public format!: string;
  public room!: string;
  public totalSeats!: number;
  public active!: boolean;
}

CinemaFunction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Movie, key: 'id' },
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir nulo para compatibilidad si no se asocia a sala física en test viejos
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Compatibilidad con HU-004
    dateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CinemaFunction',
    tableName: 'functions',
    timestamps: true,
  },
);

export default CinemaFunction;
