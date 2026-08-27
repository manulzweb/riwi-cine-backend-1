// app/src/models/upcoming-movie-notification.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface UpcomingMovieNotificationAttributes {
  id: number;
  userId: number;
  movieId: number;
  notifiedAt: Date | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpcomingMovieNotificationCreationAttributes extends Optional<
  UpcomingMovieNotificationAttributes,
  'id' | 'notifiedAt'
> {}

class UpcomingMovieNotification
  extends Model<UpcomingMovieNotificationAttributes, UpcomingMovieNotificationCreationAttributes>
  implements UpcomingMovieNotificationAttributes
{
  public id!: number;
  public userId!: number;
  public movieId!: number;
  public notifiedAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UpcomingMovieNotification.init(
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
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'movie_id',
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'notified_at',
    },
  },
  {
    sequelize,
    modelName: 'UpcomingMovieNotification',
    tableName: 'upcoming_movie_notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id'],
      },
    ],
  },
);

export default UpcomingMovieNotification;
