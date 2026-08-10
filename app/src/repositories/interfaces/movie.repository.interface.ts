// app/src/repositories/interfaces/movie.repository.interface.ts

import Movie from "../../models/movie.model";
import MovieFunction from "../../models/function.model";

/**
 * Contrato del Repositorio de Películas.
 * Define únicamente accesos a datos, sin reglas de negocio.
 */
export interface IMovieRepository {
  /** Busca una película activa por su id. */
  findById(id: number): Promise<Movie | null>;

  /** Obtiene todas las funciones (activas o no) de una película. */
  findFunctionsByMovieId(movieId: number): Promise<MovieFunction[]>;

  /** Obtiene películas activas que compartan al menos un género, excluyendo el id dado. */
  findByGenres(genres: string[], excludeId: number, limit: number): Promise<Movie[]>;
}
