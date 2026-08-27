// app/src/__tests__/services/upcoming-notification.service.test.ts

import upcomingNotificationService from '../../services/upcoming-notification.service.js';
import Movie from '../../models/movie.model.js';
import userRepository from '../../repositories/user.repository.js';
import notificationRepository from '../../repositories/upcoming-notification.repository.js';

jest.mock('../../models/movie.model.js', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../repositories/user.repository.js');
jest.mock('../../repositories/upcoming-notification.repository.js');

describe('UpcomingNotificationService · HU-005', () => {
  const activeUser = { id: 12, isActive: true };
  const upcomingMovie = { id: 1, isActive: true, releaseDate: '2099-01-01' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar la solicitud de notificación exitosamente', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(activeUser);
    (Movie.findOne as jest.Mock).mockResolvedValue(upcomingMovie);
    (notificationRepository.findByUserAndMovie as jest.Mock).mockResolvedValue(null);
    (notificationRepository.create as jest.Mock).mockResolvedValue({
      id: 99,
      userId: 12,
      movieId: 1,
    });

    const result = await upcomingNotificationService.register({ movieId: 1, userId: 12 });

    expect(result).toEqual({ id: 99, userId: 12, movieId: 1 });
    expect(notificationRepository.create).toHaveBeenCalledWith({
      userId: 12,
      movieId: 1,
    });
  });

  it('debería resolver el usuario por email', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(activeUser);
    (Movie.findOne as jest.Mock).mockResolvedValue(upcomingMovie);
    (notificationRepository.findByUserAndMovie as jest.Mock).mockResolvedValue(null);
    (notificationRepository.create as jest.Mock).mockResolvedValue({
      id: 100,
      userId: 12,
      movieId: 1,
    });

    const result = await upcomingNotificationService.register({
      movieId: 1,
      email: 'User@Example.com',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(result.userId).toBe(12);
  });

  it('debería lanzar error si el usuario no existe', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(upcomingNotificationService.register({ movieId: 1, userId: 999 })).rejects.toThrow(
      'Usuario no encontrado.',
    );
  });

  it('debería lanzar error si el usuario no está activo', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: 12, isActive: false });

    await expect(upcomingNotificationService.register({ movieId: 1, userId: 12 })).rejects.toThrow(
      'El usuario no está activo.',
    );
  });

  it('debería lanzar error si la película no existe', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(activeUser);
    (Movie.findOne as jest.Mock).mockResolvedValue(null);

    await expect(upcomingNotificationService.register({ movieId: 1, userId: 12 })).rejects.toThrow(
      'Película no encontrada.',
    );
  });

  it('debería lanzar error si la película ya está en cartelera (RN-017)', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(activeUser);
    (Movie.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      isActive: true,
      releaseDate: '2020-01-01',
    });

    await expect(upcomingNotificationService.register({ movieId: 1, userId: 12 })).rejects.toThrow(
      'La película ya se encuentra en cartelera.',
    );
  });

  it('debería lanzar error si ya existe una solicitud (RN-019)', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(activeUser);
    (Movie.findOne as jest.Mock).mockResolvedValue(upcomingMovie);
    (notificationRepository.findByUserAndMovie as jest.Mock).mockResolvedValue({ id: 1 });

    await expect(upcomingNotificationService.register({ movieId: 1, userId: 12 })).rejects.toThrow(
      'Ya registraste una solicitud de notificación para esta película.',
    );
  });
});
