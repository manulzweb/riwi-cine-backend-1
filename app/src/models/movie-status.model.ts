// app/src/models/movie-status.model.ts

/**
 * Modelo de Estado de Película (MovieStatus)
 * ------------------------------------------
 * Representa los posibles estados de una película.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MovieStatusAttributes {
  id: number;
  name: string; // Ej: "Próximamente", "En Estreno", "Disponible", "Archivada"
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MovieStatusCreationAttributes extends Optional<
  MovieStatusAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

class MovieStatus
  extends Model<MovieStatusAttributes, MovieStatusCreationAttributes>
  implements MovieStatusAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

MovieStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MovieStatus',
    tableName: 'movie_statuses',
    timestamps: true,
  },
);

export default MovieStatus;
