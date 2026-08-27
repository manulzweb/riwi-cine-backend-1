// app/src/__tests__/services/email-notification.service.test.ts

import emailNotificationService from '../../services/email-notification.service.js';
import Movie from '../../models/movie.model.js';
import UpcomingMovieNotification from '../../models/upcoming-movie-notification.model.js';
import User from '../../models/user.model.js';
import { sendUpcomingReleaseEmail } from '../../config/mailer.js';

jest.mock('../../models/movie.model.js', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

jest.mock('../../models/upcoming-movie-notification.model.js', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

jest.mock('../../models/user.model.js', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../../config/mailer.js', () => ({
  __esModule: true,
  sendUpcomingReleaseEmail: jest.fn(),
}));

describe('EmailNotificationService · processTodayReleases (RN-020)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar 0 si no hay películas con releaseDate == hoy', async () => {
    (Movie.findAll as jest.Mock).mockResolvedValue([]);

    const result = await emailNotificationService.processTodayReleases();

    expect(result).toEqual({ moviesProcessed: 0, emailsSent: 0, errors: [] });
    expect(Movie.findAll).toHaveBeenCalledTimes(1);
  });

  it('debería enviar emails y marcar notifiedAt para notificaciones pendientes', async () => {
    const mockMovie = { id: 1, title: 'Guardianes del Tiempo', releaseDate: '2026-08-20' };
    const mockNotification = {
      id: 10,
      userId: 5,
      movieId: 1,
      notifiedAt: null,
      update: jest.fn().mockResolvedValue(true),
    };
    const mockUser = { id: 5, email: 'user@test.com', isActive: true };

    (Movie.findAll as jest.Mock).mockResolvedValue([mockMovie]);
    (UpcomingMovieNotification.findAll as jest.Mock).mockResolvedValue([mockNotification]);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (sendUpcomingReleaseEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await emailNotificationService.processTodayReleases();

    expect(result.moviesProcessed).toBe(1);
    expect(result.emailsSent).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(sendUpcomingReleaseEmail).toHaveBeenCalledWith('user@test.com', 'Guardianes del Tiempo');
    expect(mockNotification.update).toHaveBeenCalledWith({ notifiedAt: expect.any(Date) });
  });

  it('debería registrar errores sin detener el procesamiento', async () => {
    const mockMovie = { id: 1, title: 'Película A', releaseDate: '2026-08-20' };
    const mockNotification1 = {
      id: 10,
      userId: 5,
      movieId: 1,
      notifiedAt: null,
      update: jest.fn(),
    };
    const mockNotification2 = {
      id: 11,
      userId: 6,
      movieId: 1,
      notifiedAt: null,
      update: jest.fn().mockResolvedValue(true),
    };

    (Movie.findAll as jest.Mock).mockResolvedValue([mockMovie]);
    (UpcomingMovieNotification.findAll as jest.Mock).mockResolvedValue([
      mockNotification1,
      mockNotification2,
    ]);
    (User.findByPk as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 6, email: 'user2@test.com', isActive: true });
    (sendUpcomingReleaseEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await emailNotificationService.processTodayReleases();

    expect(result.emailsSent).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(mockNotification2.update).toHaveBeenCalled();
  });
});
