// app/src/services/interfaces/movie.service.interface.ts

import Movie from '../../models/movie.model';
import { FilterMoviesDto } from '../../dto/request/filter-movies.dto';
import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
} from '../../dto/response/movie-detail.dto';

/**
 * Contrato del Servicio de Películas.
 */
export interface IMovieService {
  // --- Métodos de HU-004 ---
  /** Retorna el detalle completo de una película, o null si no existe/no está activa. */
  getMovieDetail(id: number): Promise<MovieDetailDto | null>;

  /** Retorna únicamente las funciones futuras de una película (RN-014), marcando agotadas (RN-015). */
  getMovieFunctions(id: number): Promise<MovieFunctionDto[] | null>;

  /** Retorna películas recomendadas por similitud de género. */
  getMovieRecommendations(id: number): Promise<MovieRecommendationDto[] | null>;

  // --- Métodos de develop / HU-003 ---
  findAll(): Promise<Movie[]>;

  findWeekly(): Promise<Movie[]>;

  findToday(): Promise<Movie[]>;

  findByFilters(filters: FilterMoviesDto): Promise<Movie[]>;
}
