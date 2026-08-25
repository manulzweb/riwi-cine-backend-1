// app/src/models/movie.model.ts

/**
 * Modelo de Película (Movie)
 * ---------------------------
 * Representa la tabla `movies`. Contiene toda la información necesaria
 * para la HU-004 (Consulta del Detalle de una Película) y para la cartelera.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MovieAttributes {
  id: number;
  title: string;
  synopsis: string;
  director: string;
  actors: string[]; // Actores principales
  genres: string[]; // Ej: ["Acción", "Ciencia Ficción"]
  languages: string[]; // Idiomas disponibles, ej: ["Español", "Subtitulada"]
  formats: string[]; // Ej: ["2D", "3D", "IMAX", "VIP"]
  duration: number; // Duración en minutos
  classification: string; // Clasificación, ej: "PG-13"
  releaseDate: Date;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string | null; // URL o ID del video de YouTube
  averageRating: number; // Calificación promedio del público (0-5 o 0-10, unificado a 0-5 o similar)
  active: boolean; // Si la película sigue en cartelera

  // Compatibilidad con la rama develop
  genre: string;
  language: string;
  isSubtitled: boolean;
  rating: number | null;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MovieCreationAttributes extends Optional<
  MovieAttributes,
  | 'id'
  | 'averageRating'
  | 'active'
  | 'genre'
  | 'language'
  | 'isSubtitled'
  | 'rating'
  | 'isActive'
  | 'bannerUrl'
  | 'actors'
  | 'genres'
  | 'languages'
  | 'formats'
> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  declare public id: number;
  declare public title: string;
  declare public synopsis: string;
  declare public director: string;
  declare public actors: string[];
  declare public genres: string[];
  declare public languages: string[];
  declare public formats: string[];
  declare public duration: number;
  declare public classification: string;
  declare public releaseDate: Date;
  declare public posterUrl: string;
  declare public bannerUrl: string;
  declare public trailerUrl: string | null;
  declare public averageRating: number;
  declare public active: boolean;

  // Compatibilidad con develop
  declare public genre: string;
  declare public language: string;
  declare public isSubtitled: boolean;
  declare public rating: number | null;
  declare public isActive: boolean;
}

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
    // Columnas de develop para compatibilidad
    genre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isSubtitled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    modelName: 'Movie',
    tableName: 'movies',
    timestamps: true,
  },
);

export default Movie;
