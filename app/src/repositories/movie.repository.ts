// app/src/repositories/movie.repository.ts

import { Op, WhereOptions } from 'sequelize';
import Movie from '../models/movie.model.js';
import CinemaFunction from '../models/function.model.js';
import Room from '../models/room.model.js';
import { IMovieRepository } from './interfaces/movie.repository.interface.js';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto.js';
import { FunctionAttributes } from '../models/function.model.js';
import { todayDateOnly } from '../utils/date.util.js';

/**
 * Repositorio de Películas
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Movie.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class MovieRepository implements IMovieRepository {
  // --- Métodos de HU-004 ---
  /**
   * Busca una película activa por su identificador.
   */
  async findById(id: number): Promise<Movie | null> {
    return await Movie.findOne({ where: { id, active: true } });
  }

  /**
   * Obtiene todas las funciones de una película, ordenadas por fecha y hora.
   */
  async findFunctionsByMovieId(movieId: number): Promise<CinemaFunction[]> {
    return await CinemaFunction.findAll({
      where: { movieId },
      order: [['dateTime', 'ASC']],
    });
  }

  /**
   * Obtiene películas activas que compartan géneros con la película indicada,
   * excluyéndola del resultado y ordenadas por calificación promedio.
   */
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
   * Obtiene las películas en estado "Próximo Estreno" (RN-017).
   */
  async findUpcoming(): Promise<Movie[]> {
    return await Movie.findAll({
      where: { isActive: true, releaseDate: { [Op.gt]: todayDateOnly() } },
      order: [['releaseDate', 'ASC']],
    });
  }

  /**
   * Busca una película activa en estado "Próximo Estreno" por su id (HU-005).
   */
  async findUpcomingById(id: number): Promise<Movie | null> {
    return await Movie.findOne({
      where: { id, isActive: true, releaseDate: { [Op.gt]: todayDateOnly() } },
    });
  }

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    in7Days.setHours(23, 59, 59, 999);

    return await Movie.findAll({
      where: { isActive: true },
      include: [
        {
          model: CinemaFunction,
          as: 'functions',
          where: {
            isActive: true,
            startTime: { [Op.between]: [today, in7Days] },
          },
          required: true,
        },
      ],
    });
  }

  /**
   * Obtiene las películas con funciones el día de hoy.
   */
  async findToday(): Promise<Movie[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await Movie.findAll({
      where: { isActive: true },
      include: [
        {
          model: CinemaFunction,
          as: 'functions',
          where: {
            isActive: true,
            startTime: { [Op.between]: [startOfDay, endOfDay] },
          },
          required: true,
        },
      ],
    });
  }

  /**
   * Obtiene películas aplicando filtros opcionales.
   */
  async findByFilters(filters: FilterMoviesDto): Promise<Movie[]> {
    const movieWhere: WhereOptions = { isActive: true };

    if (filters.classification) {
      movieWhere['classification'] = filters.classification;
    }

    // genre, language y format son arrays en la BD → Op.contains busca si el array incluye el valor
    if (filters.genre) {
      movieWhere['genres'] = { [Op.contains]: [filters.genre] };
    }

    if (filters.language) {
      movieWhere['languages'] = { [Op.contains]: [filters.language] };
    }

    if (filters.format) {
      movieWhere['formats'] = { [Op.contains]: [filters.format] };
    }

    // Si se filtra por fecha, cinemaId o disponibilidad necesitamos hacer join con funciones
    const needsFunctionJoin = filters.date || filters.cinemaId || filters.available;

    if (!needsFunctionJoin) {
      return await Movie.findAll({ where: movieWhere });
    }

    const functionWhere: WhereOptions<FunctionAttributes> = { isActive: true };

    if (filters.date) {
      const day = new Date(filters.date);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(filters.date);
      nextDay.setHours(23, 59, 59, 999);
      functionWhere['startTime'] = { [Op.between]: [day, nextDay] };
    }

    if (filters.cinemaId) {
      // Para filtrar por cine necesitamos join con Room y filtrar Room.cinemaId
      const roomIds = await Room.findAll({
        where: { cinemaId: filters.cinemaId, isActive: true },
        attributes: ['id'],
      });
      functionWhere['roomId'] = { [Op.in]: roomIds.map((r) => r.id) };
    }

    if (filters.available) {
      functionWhere['availableSeats'] = { [Op.gt]: 0 };
    }

    return await Movie.findAll({
      where: movieWhere,
      include: [
        {
          model: CinemaFunction,
          as: 'functions',
          where: functionWhere,
          required: true,
        },
      ],
    });
  }
}

export default new MovieRepository();
