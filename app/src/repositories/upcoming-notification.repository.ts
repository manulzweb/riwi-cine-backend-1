// app/src/repositories/upcoming-notification.repository.ts

import UpcomingMovieNotification, {
  UpcomingMovieNotificationCreationAttributes,
} from '../models/upcoming-movie-notification.model';
import { IUpcomingNotificationRepository } from './interfaces/upcoming-notification.repository.interface';

/**
 * Repositorio de Notificaciones de Próximos Estrenos
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad UpcomingMovieNotification.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class UpcomingNotificationRepository implements IUpcomingNotificationRepository {
  /**
   * Busca la notificación de un usuario para una película específica.
   */
  async findByUserAndMovie(
    userId: number,
    movieId: number,
  ): Promise<UpcomingMovieNotification | null> {
    return await UpcomingMovieNotification.findOne({ where: { userId, movieId } });
  }

  /**
   * Crea una nueva notificación de próximo estreno.
   */
  async create(
    data: UpcomingMovieNotificationCreationAttributes,
  ): Promise<UpcomingMovieNotification> {
    return await UpcomingMovieNotification.create(data);
  }
}

export default new UpcomingNotificationRepository();
