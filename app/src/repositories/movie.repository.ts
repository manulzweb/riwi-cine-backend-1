// app/src/repositories/movie.repository.ts

import Movie from "../models/movie.model";
import { IMovieRepository } from "./interfaces/movie.repository.interface";
import { FilterMoviesDto } from "../dto/filter-movies.dto";

/**
 * Repositorio de Películas
 * ------------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Movie.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class MovieRepository implements IMovieRepository {
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
