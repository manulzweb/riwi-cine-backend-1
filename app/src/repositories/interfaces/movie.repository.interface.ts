// app/src/repositories/interfaces/movie.repository.interface.ts

import Movie from "../../models/movie.model";
import { FilterMoviesDto } from "../../dto/filter-movies.dto";

/**
 * Contrato del Repositorio de Películas
 * --------------------------------------
 * Define las operaciones de persistencia disponibles para la entidad Movie.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IMovieRepository {
  /**
   * Obtiene todas las películas activas.
   */
  findAll(): Promise<Movie[]>;

  /**
   * Obtiene las películas con funciones en los próximos 7 días.
   */
  findWeekly(): Promise<Movie[]>;

  /**
   * Obtiene las películas con funciones el día de hoy.
   */
  findToday(): Promise<Movie[]>;

  /**
   * Obtiene películas aplicando filtros opcionales.
   */
  findByFilters(filters: FilterMoviesDto): Promise<Movie[]>;
}
