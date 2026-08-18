// app/src/repositories/upcoming-notification.repository.ts

import UpcomingMovieNotification, {
  UpcomingMovieNotificationCreationAttributes,
} from '../models/upcoming-movie-notification.model';
import { IUpcomingNotificationRepository } from './interfaces/upcoming-notification.repository.interface';

class UpcomingNotificationRepository implements IUpcomingNotificationRepository {
  async findByUserAndMovie(
    userId: number,
    movieId: number,
  ): Promise<UpcomingMovieNotification | null> {
    return await UpcomingMovieNotification.findOne({ where: { userId, movieId } });
  }

  async create(
    data: UpcomingMovieNotificationCreationAttributes,
  ): Promise<UpcomingMovieNotification> {
    return await UpcomingMovieNotification.create(data);
  }
}

export default new UpcomingNotificationRepository();
