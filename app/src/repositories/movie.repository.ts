// app/src/repositories/movie.repository.ts

import { Op, WhereOptions } from 'sequelize';
import Movie from '../models/movie.model.js';
import CinemaFunction, { FunctionAttributes } from '../models/function.model.js';
import Room from '../models/room.model.js';
import Cinema from '../models/cinema.model.js';
import { IMovieRepository } from './interfaces/movie.repository.interface.js';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto.js';
import { getTodayDate } from '../utils/date.util.js';

/**
 * Repositorio de Películas
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Movie.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class MovieRepository implements IMovieRepository {
  // ==========================================================================
  // --- Métodos de HU-004 (Detalle, Funciones y Recomendaciones) ---
  // ==========================================================================

  /**
   * Busca una película activa por su identificador.
   */
  async findById(id: number): Promise<Movie | null> {
    return await Movie.findOne({
      where: {
        id,
        [Op.or]: [{ isActive: true }, { active: true }],
      },
    });
  }

  /**
   * Obtiene todas las funciones de una película, opcionalmente filtradas
   * por ciudad y ordenadas cronológicamente.
   */
  async findFunctionsByMovieId(movieId: number, cityId?: number): Promise<CinemaFunction[]> {
    const whereClause: WhereOptions<FunctionAttributes> = { movieId };

    if (cityId) {
      const roomIds = await this.getRoomIdsForCity(cityId);
      if (roomIds.length === 0) {
        return [];
      }
      whereClause['roomId'] = { [Op.in]: roomIds };
    }

    return await CinemaFunction.findAll({
      where: whereClause,
      order: [['startTime', 'ASC']],
    });
  }

  /**
   * Obtiene películas activas que compartan géneros con la película indicada,
   * excluyéndola del resultado y ordenadas por calificación promedio descendente.
   */
  async findByGenres(genres: string[], excludeId: number, limit: number): Promise<Movie[]> {
    if (!genres || genres.length === 0) {
      return [];
    }

    return await Movie.findAll({
      where: {
        id: { [Op.ne]: excludeId },
        [Op.or]: [{ isActive: true }, { active: true }],
        genres: { [Op.overlap]: genres },
      },
      order: [['averageRating', 'DESC']],
      limit,
    });
  }

  /**
   * Helper privado para obtener los IDs de salas ubicadas en una ciudad específica.
   */
  private async getRoomIdsForCity(cityId: number): Promise<number[]> {
    const rooms = await Room.findAll({
      include: [
        {
          model: Cinema,
          as: 'cinema',
          where: { cityId, isActive: true },
          attributes: [],
        },
      ],
      where: { isActive: true },
      attributes: ['id'],
    });

    return rooms.map((room) => room.id);
  }

  // --- Métodos de develop / HU-003 ---
  /**
   * Obtiene las películas en estado "Próximo Estreno" (RN-017).
   */
  async findUpcoming(): Promise<Movie[]> {
    return await Movie.findAll({
      where: { isActive: true, releaseDate: { [Op.gt]: getTodayDate() } },
      order: [['releaseDate', 'ASC']],
    });
  }

  /**
   * Busca una película activa en estado "Próximo Estreno" por su id (HU-005).
   */
  async findUpcomingById(id: number): Promise<Movie | null> {
    return await Movie.findOne({
      where: { id, isActive: true, releaseDate: { [Op.gt]: getTodayDate() } },
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
    const movieWhere = this.buildMovieWhereClause(filters);
    const needsFunctionJoin = Boolean(filters.date || filters.cinemaId || filters.available);

    if (!needsFunctionJoin) {
      return await Movie.findAll({ where: movieWhere });
    }

    const functionWhere = await this.buildFunctionWhereClause(filters);

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

  /**
   * Construye las condiciones de filtrado para la entidad Movie.
   */
  private buildMovieWhereClause(filters: FilterMoviesDto): WhereOptions {
    const movieWhere: WhereOptions = { isActive: true };

    if (filters.classification) {
      movieWhere['classification'] = filters.classification;
    }
    if (filters.genre) {
      movieWhere['genres'] = { [Op.contains]: [filters.genre] };
    }
    if (filters.language) {
      movieWhere['languages'] = { [Op.contains]: [filters.language] };
    }
    if (filters.format) {
      movieWhere['formats'] = { [Op.contains]: [filters.format] };
    }

    return movieWhere;
  }

  /**
   * Construye las condiciones de filtrado para las funciones asociadas.
   */
  private async buildFunctionWhereClause(
    filters: FilterMoviesDto,
  ): Promise<WhereOptions<FunctionAttributes>> {
    const functionWhere: WhereOptions<FunctionAttributes> = { isActive: true };

    if (filters.date) {
      const day = new Date(filters.date);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(filters.date);
      nextDay.setHours(23, 59, 59, 999);
      functionWhere['startTime'] = { [Op.between]: [day, nextDay] };
    }

    if (filters.cinemaId) {
      const rooms = await Room.findAll({
        where: { cinemaId: filters.cinemaId, isActive: true },
        attributes: ['id'],
      });
      functionWhere['roomId'] = { [Op.in]: rooms.map((r) => r.id) };
    }

    if (filters.available) {
      functionWhere['availableSeats'] = { [Op.gt]: 0 };
    }

    return functionWhere;
  }
}

export default MovieRepository;
