// app/src/services/interfaces/movie.service.interface.ts

import Movie from "../../models/movie.model";
import { FilterMoviesDto } from "../../dto/filter-movies.dto";

/**
 * Contrato del Servicio de Películas.
 */

export interface IMovieService {
  findAll(): Promise<Movie[]>;

  findWeekly(): Promise<Movie[]>;

  findToday(): Promise<Movie[]>;

  findByFilters(filters: FilterMoviesDto): Promise<Movie[]>;
}
