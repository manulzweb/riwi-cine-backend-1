// app/src/services/interfaces/movie.service.interface.ts

import Movie from '../../models/movie.model.js';
import { FilterMoviesDto } from '../../dto/request/filter-movies.dto.js';
import { UpcomingMovieDto } from '../../dto/response/upcoming-movie.dto.js';
import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
} from '../../dto/response/movie-detail.dto.js';

/**
 * Contrato del Servicio de Películas.
 */
export interface IMovieService {
  // --- Métodos de HU-004 ---
  /** Retorna el detalle completo de una película. */
  getMovieDetail(id: number): Promise<MovieDetailDto>;

  /** Retorna únicamente las funciones futuras de una película (RN-014), marcando agotadas (RN-015) y filtradas opcionalmente por ciudad. */
  getMovieFunctions(id: number, cityId?: number): Promise<MovieFunctionDto[]>;

  /** Retorna películas recomendadas por similitud de género. */
  getMovieRecommendations(id: number): Promise<MovieRecommendationDto[]>;

  // --- Métodos de develop / HU-003 ---
  /** Retorna las películas en estado "Próximo Estreno" (HU-005). */
  findUpcoming(): Promise<UpcomingMovieDto[]>;

  /** Retorna el detalle de una película en estado "Próximo Estreno" (HU-005). */
  getUpcomingMovie(id: number): Promise<UpcomingMovieDto>;

  findAll(): Promise<Movie[]>;

  findWeekly(): Promise<Movie[]>;

  findToday(): Promise<Movie[]>;

  findByFilters(filters: FilterMoviesDto): Promise<Movie[]>;
}
