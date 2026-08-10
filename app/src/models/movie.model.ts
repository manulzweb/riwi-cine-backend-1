// app/src/models/movie.model.ts

/**
 * Modelo de Película
 * ------------------
 * Este archivo define el modelo `Movie` de Sequelize, que representa
 * la tabla `movies` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`MovieAttributes`).
 *  - Atributos requeridos para la creación (`MovieCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Este modelo es utilizado por los servicios y controladores para
 * realizar operaciones de consulta de la cartelera.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Atributos principales de la entidad `Movie`.
 */
export interface MovieAttributes {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  classification: string;
  duration: number;
  director: string;
  language: string;
  isSubtitled: boolean;
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: Date;
  rating: number | null;
  isActive: boolean;
}

/**
 * Atributos utilizados para la creación de una nueva película.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export interface MovieCreationAttributes extends Optional<
  MovieAttributes,
  "id"
> {}

/**
 * Clase que representa el modelo `Movie` en Sequelize.
 */
class Movie
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  /** Identificador único de la película (clave primaria). */
  public id!: number;

  /** Título de la película. */
  public title!: string;

  /** Sinopsis completa de la película. */
  public synopsis!: string;

  /** Género de la película (ej. Acción, Drama, Comedia). */
  public genre!: string;

  /** Clasificación de edad (ej. G, PG, PG-13, R). */
  public classification!: string;

  /** Duración de la película en minutos. */
  public duration!: number;

  /** Nombre del director. */
  public director!: string;

  /** Idioma original de la película. */
  public language!: string;

  /** Indica si la película está subtitulada. */
  public isSubtitled!: boolean;

  /** URL del poster oficial. */
  public posterUrl!: string;

  /** URL del tráiler oficial (YouTube). */
  public trailerUrl!: string | null;

  /** Fecha de estreno. */
  public releaseDate!: Date;

  /** Calificación promedio del público (0.0 - 10.0). */
  public rating!: number | null;

  /** Indica si la película está activa en cartelera. */
  public isActive!: boolean;
}

/**
 * Inicialización del modelo `Movie` con la configuración de Sequelize.
 */
Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    classification: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    director: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isSubtitled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    posterUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    trailerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Movie", // Nombre del modelo en Sequelize
    tableName: "movies", // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
  },
);

export default Movie;
