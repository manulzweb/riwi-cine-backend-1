// app/src/models/movie.model.ts

/**
 * Modelo de Película (Movie)
 * ---------------------------
 * Representa la tabla `movies`. Contiene toda la información necesaria
 * para la HU-004 (Consulta del Detalle de una Película).
 *
 * Nota de equipo:
 * Este modelo también es consumido por HU-003 (Cartelera Semanal). Si el
 * compañero encargado de HU-003 ya creó una versión de este modelo,
 * deben unificarlo en una sola fuente de verdad antes del merge a main.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MovieAttributes {
  id: number;
  title: string;
  synopsis: string;
  director: string;
  actors: string[];        // Actores principales
  genres: string[];        // Ej: ["Acción", "Ciencia Ficción"]
  languages: string[];     // Idiomas disponibles, ej: ["Español", "Subtitulada"]
  formats: string[];       // Ej: ["2D", "3D", "IMAX", "VIP"]
  duration: number;        // Duración en minutos
  classification: string;  // Clasificación, ej: "PG-13"
  releaseDate: Date;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;      // URL o ID del video de YouTube
  averageRating: number;   // Calificación promedio del público (0-5)
  active: boolean;         // Si la película sigue en cartelera
}

export interface MovieCreationAttributes
  extends Optional<MovieAttributes, "id" | "averageRating" | "active"> {}

class Movie
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  public id!: number;
  public title!: string;
  public synopsis!: string;
  public director!: string;
  public actors!: string[];
  public genres!: string[];
  public languages!: string[];
  public formats!: string[];
  public duration!: number;
  public classification!: string;
  public releaseDate!: Date;
  public posterUrl!: string;
  public bannerUrl!: string;
  public trailerUrl!: string;
  public averageRating!: number;
  public active!: boolean;
}

Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    director: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    actors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    formats: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classification: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    posterUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    bannerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    trailerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Movie",
    tableName: "movies",
    timestamps: true,
  }
);

export default Movie;
