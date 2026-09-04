// app/src/containers/upcoming-notification.container.ts

import { UpcomingNotificationController } from '../controllers/upcoming-notification.controller.js';
import UpcomingNotificationRepository from '../repositories/upcoming-notification.repository.js';
import UserRepository from '../repositories/user.repository.js';
import MovieRepository from '../repositories/movie.repository.js';
import UpcomingNotificationService from '../services/upcoming-notification.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Notificaciones de Próximos Estrenos
 * ============================================================================
 */

const upcomingNotificationRepository = new UpcomingNotificationRepository();
const userRepository = new UserRepository();
const movieRepository = new MovieRepository();

const upcomingNotificationService = new UpcomingNotificationService(
  upcomingNotificationRepository,
  userRepository,
  movieRepository,
);

export const upcomingNotificationController = new UpcomingNotificationController(
  upcomingNotificationService,
);
