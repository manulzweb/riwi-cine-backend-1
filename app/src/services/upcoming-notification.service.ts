// app/src/services/upcoming-notification.service.ts

import Movie from '../models/movie.model.js';
import User from '../models/user.model.js';
import UpcomingMovieNotification from '../models/upcoming-movie-notification.model.js';
import { NotificationUpcomingDto } from '../schemas/notification.schemas.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { IMovieRepository } from '../repositories/interfaces/movie.repository.interface.js';
import { IUpcomingNotificationRepository } from '../repositories/interfaces/upcoming-notification.repository.interface.js';
import {
  IUpcomingNotificationService,
  UpcomingNotificationResult,
} from './interfaces/upcoming-notification.service.interface.js';
import { getTodayDate } from '../utils/date.util.js';
import {
  MovieNotFoundError,
  MovieNotUpcomingError,
  NotificationAlreadyRegisteredError,
  UserInactiveError,
  UserNotFoundError,
} from '../errors/movie.errors.js';

/**
 * Servicio encargado de gestionar las solicitudes de notificación
 * de próximos estrenos (HU-005).
 *
 * Responsabilidades:
 * - Resolver el usuario solicitante mediante su identificador o su correo.
 * - Validar la existencia y vigencia de la película solicitada (RN-017).
 * - Impedir solicitudes duplicadas por usuario y película (RN-019).
 * - Registrar nuevas solicitudes de notificación.
 *
 * Sigue el patrón de Inyección de Dependencias (DI) sin instanciar repositorios directamente.
 *
 * @class UpcomingNotificationService
 * @implements {IUpcomingNotificationService}
 *
 * @business
 * - RN-017: únicamente pueden registrarse notificaciones para películas activas con estreno futuro.
 * - RN-019: cada usuario solo puede registrar una solicitud de notificación por película.
 */
class UpcomingNotificationService implements IUpcomingNotificationService {
  constructor(
    private readonly notificationRepository: IUpcomingNotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly movieRepository: IMovieRepository,
  ) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
    this.movieRepository = movieRepository;
  }

  /**
   * Registra una solicitud de notificación para un próximo estreno.
   *
   * Orquesta las validaciones de usuario, película y duplicados mediante helpers
   * privados y persiste la nueva notificación.
   *
   * @async
   * @param {NotificationUpcomingDto} dto Datos de la solicitud.
   * @returns {Promise<UpcomingNotificationResult>} Resultado de la notificación registrada.
   */
  async register(dto: NotificationUpcomingDto): Promise<UpcomingNotificationResult> {
    // 1. Resolver y validar usuario (Fail-Fast)
    const user = await this.resolveUserOrThrow(dto);

    // 2. Validar que la película sea un próximo estreno activo (RN-017)
    const movie = await this.validateUpcomingMovieOrThrow(dto.movieId);

    // 3. Validar no duplicidad de solicitud (RN-019)
    await this.validateNoDuplicateNotification(user.id, movie.id);

    // 4. Registrar la notificación
    const notification = await this.notificationRepository.create({
      userId: user.id,
      movieId: movie.id,
    });

    return this.toResultDto(notification);
  }

  // ==========================================================================
  // --- Helpers Privados de Dominio (SRP) ---
  // ==========================================================================

  /**
   * Resuelve el usuario solicitante por ID o Email y valida su estado activo.
   *
   * @private
   * @param {NotificationUpcomingDto} dto DTO de entrada.
   * @returns {Promise<User>} Usuario activo encontrado.
   * @throws {UserNotFoundError} Si el usuario no existe.
   * @throws {UserInactiveError} Si el usuario está inactivo.
   */
  private async resolveUserOrThrow(dto: NotificationUpcomingDto): Promise<User> {
    let user: User | null = null;

    if (dto.userId) {
      user = await this.userRepository.findById(dto.userId);
    } else if (dto.email) {
      user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    }

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new UserInactiveError();
    }

    return user;
  }

  /**
   * Valida que la película exista, esté activa y su fecha de estreno sea estrictamente futura (RN-017).
   *
   * @private
   * @param {number} movieId Identificador de la película.
   * @returns {Promise<Movie>} Película válida de próximo estreno.
   * @throws {MovieNotFoundError} Si la película no existe o no está activa.
   * @throws {MovieNotUpcomingError} Si la película ya se estrenó o está en cartelera.
   */
  private async validateUpcomingMovieOrThrow(movieId: number): Promise<Movie> {
    const movie = await this.movieRepository.findUpcomingById(movieId);

    if (!movie) {
      // Verificar si existe la película en general
      const generalMovie = await this.movieRepository.findById(movieId);
      if (!generalMovie) {
        throw new MovieNotFoundError();
      }
      throw new MovieNotUpcomingError();
    }

    const releaseDate =
      movie.releaseDate instanceof Date
        ? movie.releaseDate.toISOString().slice(0, 10)
        : String(movie.releaseDate).slice(0, 10);

    if (releaseDate <= getTodayDate()) {
      throw new MovieNotUpcomingError();
    }

    return movie;
  }

  /**
   * Valida que el usuario no haya registrado previamente un aviso para la misma película (RN-019).
   *
   * @private
   * @param {number} userId ID del usuario.
   * @param {number} movieId ID de la película.
   * @throws {NotificationAlreadyRegisteredError} Si ya existe una solicitud previa.
   */
  private async validateNoDuplicateNotification(userId: number, movieId: number): Promise<void> {
    const existing = await this.notificationRepository.findByUserAndMovie(userId, movieId);
    if (existing) {
      throw new NotificationAlreadyRegisteredError();
    }
  }

  /**
   * Transforma la notificación persistida al DTO de resultado.
   *
   * @private
   */
  private toResultDto(notification: UpcomingMovieNotification): UpcomingNotificationResult {
    return {
      id: notification.id,
      userId: notification.userId,
      movieId: notification.movieId,
    };
  }
}

export default UpcomingNotificationService;
