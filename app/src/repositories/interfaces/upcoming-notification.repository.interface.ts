// app/src/repositories/interfaces/upcoming-notification.repository.interface.ts

import UpcomingMovieNotification, {
  UpcomingMovieNotificationCreationAttributes,
} from '../../models/upcoming-movie-notification.model';

export interface IUpcomingNotificationRepository {
  /** Busca una solicitud de aviso por usuario y película (RN-019). */
  findByUserAndMovie(userId: number, movieId: number): Promise<UpcomingMovieNotification | null>;

  /** Registra una nueva solicitud de aviso. */
  create(data: UpcomingMovieNotificationCreationAttributes): Promise<UpcomingMovieNotification>;
}
