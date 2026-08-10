// app/src/services/interfaces/movie.service.interface.ts

import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
} from "../../dto/movie-detail.dto";

/**
 * Contrato del Servicio de Películas (HU-004).
 */
export interface IMovieService {
  /** Retorna el detalle completo de una película, o null si no existe/no está activa. */
  getMovieDetail(id: number): Promise<MovieDetailDto | null>;

  /** Retorna únicamente las funciones futuras de una película (RN-014), marcando agotadas (RN-015). */
  getMovieFunctions(id: number): Promise<MovieFunctionDto[] | null>;

  /** Retorna películas recomendadas por similitud de género. */
  getMovieRecommendations(id: number): Promise<MovieRecommendationDto[] | null>;
}
