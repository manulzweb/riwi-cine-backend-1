// app/src/models/function.model.ts

/**
 * Modelo de Función
 * -----------------
 * Este archivo define el modelo `Function` de Sequelize, que representa
 * la tabla `functions` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`FunctionAttributes`).
 *  - Atributos requeridos para la creación (`FunctionCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Una función es la combinación de una película, una sala y un horario específico.
 * Es el elemento central de la cartelera semanal.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Movie from "./movie.model";
import Room from "./room.model";

/**
 * Atributos principales de la entidad `Function`.
 */
export interface FunctionAttributes {
  id: number;
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
  isActive: boolean;
}

/**
 * Atributos utilizados para la creación de una nueva función.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export interface FunctionCreationAttributes extends Optional<
  FunctionAttributes,
  "id"
> {}

/**
 * Clase que representa el modelo `Function` en Sequelize.
 */
class CinemaFunction
  extends Model<FunctionAttributes, FunctionCreationAttributes>
  implements FunctionAttributes
{
  /** Identificador único de la función (clave primaria). */
  public id!: number;

  /** Identificador de la película que se proyecta. */
  public movieId!: number;

  /** Identificador de la sala donde se proyecta. */
  public roomId!: number;

  /** Fecha y hora de inicio de la función. */
  public startTime!: Date;

  /** Fecha y hora de finalización de la función. */
  public endTime!: Date;

  /** Precio de la entrada para esta función. */
  public price!: number;

  /** Cantidad de asientos disponibles. */
  public availableSeats!: number;

  /** Indica si la función está activa. */
  public isActive!: boolean;
}

/**
 * Inicialización del modelo `CinemaFunction` con la configuración de Sequelize.
 */
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
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: "CinemaFunction", // Nombre del modelo en Sequelize
    tableName: "functions", // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
  },
);

// Una función pertenece a una película
CinemaFunction.belongsTo(Movie, { foreignKey: "movieId", as: "movie" });
Movie.hasMany(CinemaFunction, { foreignKey: "movieId", as: "functions" });

// Una función pertenece a una sala
CinemaFunction.belongsTo(Room, { foreignKey: "roomId", as: "room" });
Room.hasMany(CinemaFunction, { foreignKey: "roomId", as: "functions" });

export default CinemaFunction;
