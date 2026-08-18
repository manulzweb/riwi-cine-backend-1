// app/src/__tests__/services/movie-upcoming.service.test.ts

import movieService from '../../services/movie.service';
import movieRepository from '../../repositories/movie.repository';

jest.mock('../../repositories/movie.repository', () => ({
  __esModule: true,
  default: {
    findUpcomingById: jest.fn(),
  },
}));

describe('MovieService · getUpcomingMovie (HU-005)', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const releaseStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

  const upcomingMovie = {
    id: 7,
    title: 'Guardianes del Tiempo',
    posterUrl: 'https://picsum.photos/seed/movie1/400/600',
    releaseDate: releaseStr,
    genres: ['Ciencia Ficción', 'Aventura'],
    classification: 'PG-13',
    duration: 128,
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    synopsis: 'Un grupo de exploradores viaja entre líneas temporales.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar el detalle del próximo estreno', async () => {
    (movieRepository.findUpcomingById as jest.Mock).mockResolvedValue(upcomingMovie);

    const result = await movieService.getUpcomingMovie(7);

    expect(movieRepository.findUpcomingById).toHaveBeenCalledWith(7);
    expect(result).toEqual({
      id: 7,
      title: 'Guardianes del Tiempo',
      posterUrl: 'https://picsum.photos/seed/movie1/400/600',
      releaseDate: releaseStr,
      genres: ['Ciencia Ficción', 'Aventura'],
      classification: 'PG-13',
      duration: 128,
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      synopsis: 'Un grupo de exploradores viaja entre líneas temporales.',
      daysUntil: 5,
    });
  });

  it('debería retornar null si la película no es un próximo estreno', async () => {
    (movieRepository.findUpcomingById as jest.Mock).mockResolvedValue(null);

    const result = await movieService.getUpcomingMovie(999);

    expect(result).toBeNull();
  });
});
