// app/src/services/upcoming-notification.service.ts

import Movie from '../models/movie.model.js';
import { NotificationUpcomingDto } from '../schemas/notification.schemas.js';
import userRepository from '../repositories/user.repository.js';
import notificationRepository from '../repositories/upcoming-notification.repository.js';
import {
  IUpcomingNotificationService,
  UpcomingNotificationResult,
} from './interfaces/upcoming-notification.service.interface.js';
import { todayDateOnly } from '../utils/date.util.js';

/**
 * Servicio encargado de gestionar las solicitudes de notificación
 * de próximos estrenos.
 *
 * Responsabilidades:
 * - Resolver el usuario solicitante mediante su identificador o su correo.
 * - Validar la existencia y vigencia de la película solicitada.
 * - Impedir solicitudes duplicadas por usuario y película.
 * - Registrar nuevas solicitudes de notificación.
 *
 * El Service no realiza consultas directamente mediante Sequelize,
 * con la excepción de la lectura directa del modelo `Movie` para
 * validar el estado y la fecha de estreno. Las operaciones sobre
 * usuarios y notificaciones son delegadas a los correspondientes
 * repositories.
 *
 * @class UpcomingNotificationService
 *
 * @business
 * - RN-017: únicamente pueden registrarse notificaciones para
 *   películas activas que aún no se encuentran en cartelera.
 * - RN-019: cada usuario solo puede registrar una solicitud de
 *   notificación por película.
 */
class UpcomingNotificationService implements IUpcomingNotificationService {
  /**
   * Registra una solicitud de notificación para un próximo estreno.
   *
   * El proceso consiste en:
   *
   * 1. Resolver el usuario mediante `userId` o `email`.
   * 2. Validar que la película exista, esté activa y aún no esté
   *    en cartelera (RN-017).
   * 3. Verificar que no exista una solicitud previa del mismo
   *    usuario para la misma película (RN-019).
   * 4. Persistir la nueva solicitud.
   *
   * @param {NotificationUpcomingDto} dto
   * Datos de la solicitud: identificador o correo del usuario e
   * identificador de la película.
   *
   * @returns {Promise<UpcomingNotificationResult>}
   * Identificadores de la solicitud creada, del usuario y de la película.
   *
   * @throws {Error}
   * Cuando no se proporciona un usuario válido o este no existe.
   *
   * @throws {Error}
   * Cuando el usuario no se encuentra activo.
   *
   * @throws {Error}
   * Cuando la película no existe o no está activa.
   *
   * @throws {Error}
   * Cuando la película ya se encuentra en cartelera.
   *
   * @throws {Error}
   * Cuando el usuario ya registró una solicitud de notificación
   * para la misma película.
   */
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

/**
 * Instancia única del servicio de notificaciones de próximos estrenos
 * utilizada por la aplicación.
 *
 * @constant
 * @type {UpcomingNotificationService}
 */
export default new UpcomingNotificationService();
