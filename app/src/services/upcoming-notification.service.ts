// app/src/services/upcoming-notification.service.ts

import Movie from '../models/movie.model';
import { NotificationUpcomingDto } from '../schemas/notification.schemas';
import userRepository from '../repositories/user.repository';
import notificationRepository from '../repositories/upcoming-notification.repository';
import {
  IUpcomingNotificationService,
  UpcomingNotificationResult,
} from './interfaces/upcoming-notification.service.interface';
import { todayDateOnly } from '../utils/date.util';

class UpcomingNotificationService implements IUpcomingNotificationService {
  async register(dto: NotificationUpcomingDto): Promise<UpcomingNotificationResult> {
    // 1. Resolver usuario por userId o email.
    const user = dto.userId
      ? await userRepository.findById(dto.userId)
      : dto.email
        ? await userRepository.findByEmail(dto.email.trim().toLowerCase())
        : null;

    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    if (!user.isActive) {
      throw new Error('El usuario no está activo.');
    }

    // 2. Validar que la película exista y sea un próximo estreno (RN-017).
    const movie = await Movie.findOne({ where: { id: dto.movieId, isActive: true } });
    if (!movie) {
      throw new Error('Película no encontrada.');
    }

    const releaseDate =
      movie.releaseDate instanceof Date
        ? movie.releaseDate.toISOString().slice(0, 10)
        : String(movie.releaseDate).slice(0, 10);

    if (releaseDate <= todayDateOnly()) {
      throw new Error('La película ya se encuentra en cartelera.');
    }

    // 3. RN-019: no permitir más de una solicitud por usuario y película.
    const existing = await notificationRepository.findByUserAndMovie(user.id, movie.id);
    if (existing) {
      throw new Error('Ya registraste una solicitud de notificación para esta película.');
    }

    // 4. Registrar la solicitud.
    const notification = await notificationRepository.create({
      userId: user.id,
      movieId: movie.id,
    });

    return {
      id: notification.id,
      userId: notification.userId,
      movieId: notification.movieId,
    };
  }
}

export default new UpcomingNotificationService();
