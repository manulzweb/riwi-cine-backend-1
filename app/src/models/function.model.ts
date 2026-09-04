// app/src/models/function.model.ts

/**
 * Modelo de Función (Showtime)
 * -----------------------------
 * Representa una función/horario disponible para una película, en un complex/sala.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Movie from './movie.model.js';

export interface FunctionAttributes {
  id: number;
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
  isActive: boolean;
  format: string;
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
  | 'format'
  | 'room'
  | 'totalSeats'
  | 'startTime'
> {}

class CinemaFunction
  extends Model<FunctionAttributes, FunctionCreationAttributes>
  implements FunctionAttributes
{
  declare id: number;
  declare movieId: number;
  declare roomId: number;
  declare startTime: Date;
  declare endTime: Date;
  declare price: number;
  declare availableSeats: number;
  declare isActive: boolean;
  declare format: string;
  declare room: string;
  declare totalSeats: number;
  declare active: boolean;
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
