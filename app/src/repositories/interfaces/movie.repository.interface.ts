// app/src/repositories/interfaces/movie.repository.interface.ts

import Movie from '../../models/movie.model.js';
import CinemaFunction from '../../models/function.model.js';
import { FilterMoviesDto } from '../../dto/request/filter-movies.dto.js';

/**
 * Contrato del Repositorio de Películas.
 * Define las operaciones de persistencia disponibles para la entidad Movie.
 */
export interface IMovieRepository {
  /** Busca una película activa por su id. (HU-004) */
  findById(id: number): Promise<Movie | null>;

  /** Obtiene todas las funciones (activas o no) de una película. (HU-004) */
  findFunctionsByMovieId(movieId: number): Promise<CinemaFunction[]>;

  /** Obtiene películas activas que compartan al menos un género, excluyendo el id dado. (HU-004) */
  findByGenres(genres: string[], excludeId: number, limit: number): Promise<Movie[]>;

  /** Obtiene las películas en estado "Próximo Estreno" (HU-005). */
  findUpcoming(): Promise<Movie[]>;

  /** Busca una película activa en estado "Próximo Estreno" por su id (HU-005). */
  findUpcomingById(id: number): Promise<Movie | null>;

  /** Obtiene todas las películas activas. (develop/HU-003) */
  findAll(): Promise<Movie[]>;

  /** Obtiene las películas con funciones en los próximos 7 días. (develop/HU-003) */
  findWeekly(): Promise<Movie[]>;

  /** Obtiene las películas con funciones el día de hoy. (develop/HU-003) */
  findToday(): Promise<Movie[]>;

  /** Obtiene películas aplicando filtros opcionales. (develop/HU-003) */
  findByFilters(filters: FilterMoviesDto): Promise<Movie[]>;
}
