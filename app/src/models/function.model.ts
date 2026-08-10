// app/src/models/function.model.ts

/**
 * Modelo de Función (Showtime)
 * -----------------------------
 * Representa una función/horario disponible para una película, en un
 * formato (2D, 3D, IMAX, VIP) y con un precio y aforo determinados.
 *
 * Nota de equipo:
 * Este modelo lo necesitan tanto HU-003 (Cartelera) como HU-004 (Detalle).
 * Coordinar con el compañero de HU-003 para no duplicar la tabla `functions`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Movie from "./movie.model";

export interface FunctionAttributes {
  id: number;
  movieId: number;
  dateTime: Date;
  format: string;        // 2D, 3D, IMAX, VIP
  room: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  active: boolean;
}

export interface FunctionCreationAttributes
  extends Optional<FunctionAttributes, "id" | "active"> {}

class MovieFunction
  extends Model<FunctionAttributes, FunctionCreationAttributes>
  implements FunctionAttributes
{
  public id!: number;
  public movieId!: number;
  public dateTime!: Date;
  public format!: string;
  public room!: string;
  public price!: number;
  public totalSeats!: number;
  public availableSeats!: number;
  public active!: boolean;
}

MovieFunction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Movie, key: "id" },
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    format: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "MovieFunction",
    tableName: "functions",
    timestamps: true,
  }
);

// Relaciones: una película tiene muchas funciones.
Movie.hasMany(MovieFunction, { foreignKey: "movieId", as: "functions" });
MovieFunction.belongsTo(Movie, { foreignKey: "movieId", as: "movie" });

export default MovieFunction;
