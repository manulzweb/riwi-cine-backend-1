// app/src/__tests__/controllers/movie-upcoming.controller.test.ts

import { Request, Response } from 'express';
import { getUpcomingMovies, getUpcomingMovie } from '../../controllers/movie.controller';
import movieService from '../../services/movie.service';

jest.mock('../../services/movie.service', () => ({
  __esModule: true,
  default: {
    findUpcoming: jest.fn(),
    getUpcomingMovie: jest.fn(),
  },
}));

describe('MovieController · HU-005 Próximos Estrenos', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonFn: jest.Mock;
  let statusFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockResponse = { status: statusFn };
  });

  describe('GET /movies/upcoming', () => {
    it('debería retornar 200 con la lista de próximos estrenos', async () => {
      mockRequest = {};
      const mockMovies = [
        { id: 1, title: 'Guardianes del Tiempo', releaseDate: '2026-09-15' },
        { id: 2, title: 'El Último Viaje', releaseDate: '2026-10-01' },
      ];
      (movieService.findUpcoming as jest.Mock).mockResolvedValue(mockMovies);

      await getUpcomingMovies(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(200);
      expect(jsonFn).toHaveBeenCalledWith(mockMovies);
    });

    it('debería retornar 200 con array vacío si no hay próximos estrenos', async () => {
      mockRequest = {};
      (movieService.findUpcoming as jest.Mock).mockResolvedValue([]);

      await getUpcomingMovies(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(200);
      expect(jsonFn).toHaveBeenCalledWith([]);
    });

    it('debería retornar 500 si ocurre un error interno', async () => {
      mockRequest = {};
      (movieService.findUpcoming as jest.Mock).mockRejectedValue(new Error('DB error'));

      await getUpcomingMovies(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(500);
      expect(jsonFn).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('GET /movies/upcoming/:id', () => {
    it('debería retornar 200 con el detalle del próximo estreno', async () => {
      mockRequest = { params: { id: '7' } };
      const mockMovie = { id: 7, title: 'Guardianes del Tiempo', daysUntil: 26 };
      (movieService.getUpcomingMovie as jest.Mock).mockResolvedValue(mockMovie);

      await getUpcomingMovie(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(200);
      expect(jsonFn).toHaveBeenCalledWith(mockMovie);
    });

    it('debería retornar 400 si el id no es numérico', async () => {
      mockRequest = { params: { id: 'abc' } };

      await getUpcomingMovie(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(400);
      expect(jsonFn).toHaveBeenCalledWith({ error: 'El id de la película es inválido.' });
    });

    it('debería retornar 404 si el próximo estreno no existe', async () => {
      mockRequest = { params: { id: '999' } };
      (movieService.getUpcomingMovie as jest.Mock).mockResolvedValue(null);

      await getUpcomingMovie(mockRequest as Request, mockResponse as Response);

      expect(statusFn).toHaveBeenCalledWith(404);
      expect(jsonFn).toHaveBeenCalledWith({ error: 'Próximo estreno no encontrado.' });
    });
  });
});
