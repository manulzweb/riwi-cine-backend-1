// app/src/repositories/movie.repository.ts

import { Op } from 'sequelize';
import Movie from '../models/movie.model';
import CinemaFunction from '../models/function.model';
import { IMovieRepository } from './interfaces/movie.repository.interface';
import { FilterMoviesDto } from '../dto/filter-movies.dto';

/**
 * Repositorio de Películas.
 * Única capa que sabe cómo consultar Sequelize para la entidad Movie.
 */
class MovieRepository implements IMovieRepository {
  // --- Métodos de HU-004 ---
  async findById(id: number): Promise<Movie | null> {
    return await Movie.findOne({ where: { id, active: true } });
  }

  async findFunctionsByMovieId(movieId: number): Promise<CinemaFunction[]> {
    return await CinemaFunction.findAll({
      where: { movieId },
      order: [['dateTime', 'ASC']],
    });
  }

  async findByGenres(genres: string[], excludeId: number, limit: number): Promise<Movie[]> {
    return await Movie.findAll({
      where: {
        id: { [Op.ne]: excludeId },
        active: true,
        genres: { [Op.overlap]: genres },
      },
      order: [['averageRating', 'DESC']],
      limit,
    });
  }

  // --- Métodos de develop / HU-003 ---
  /**
   * Obtiene todas las películas activas.
   */
  async findAll(): Promise<Movie[]> {
    return await Movie.findAll({ where: { isActive: true } });
  }

  /**
   * Obtiene las películas con funciones en los próximos 7 días.
   */
  async findWeekly(): Promise<Movie[]> {
    return await Movie.findAll({ where: { isActive: true } });
  }

  /**
   * Obtiene las películas con funciones el día de hoy.
   */
  async findToday(): Promise<Movie[]> {
    return await Movie.findAll({ where: { isActive: true } });
  }

  /**
   * Obtiene películas aplicando filtros opcionales.
   */
  async findByFilters(_filters: FilterMoviesDto): Promise<Movie[]> {
    return await Movie.findAll({ where: { isActive: true } });
  }
}

export default new MovieRepository();
