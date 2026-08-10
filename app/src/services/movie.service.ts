// app/src/services/movie.service.ts

import Movie from '../models/movie.model';
import { FilterMoviesDto } from '../dto/filter-movies.dto';
import repository from '../repositories/movie.repository';
import { IMovieService } from './interfaces/movie.service.interface';
import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
  PriceByFormatDto,
} from '../dto/movie-detail.dto';

const RECOMMENDATIONS_LIMIT = 6;

/**
 * Servicio de Películas
 * ---------------------
 * Contiene la lógica de negocio relacionada con la entidad Movie (HU-003 y HU-004).
 */
class MovieService implements IMovieService {
  // --- Métodos de HU-004 ---
  async getMovieDetail(id: number): Promise<MovieDetailDto | null> {
    const movie = await repository.findById(id);
    if (!movie) return null;

    const functions = await repository.findFunctionsByMovieId(movie.id);

    // Agrupa el precio por formato (toma el primero encontrado por formato).
    const pricesByFormat: PriceByFormatDto[] = [];
    for (const fn of functions) {
      if (!pricesByFormat.find((p) => p.format === fn.format)) {
        pricesByFormat.push({ format: fn.format, price: Number(fn.price) });
      }
    }

    return {
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      director: movie.director,
      actors: movie.actors,
      genres: movie.genres,
      languages: movie.languages,
      formats: movie.formats,
      duration: movie.duration,
      classification: movie.classification,
      releaseDate: movie.releaseDate.toString(),
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl || '',
      averageRating: Number(movie.averageRating),
      pricesByFormat,
    };
  }

  async getMovieFunctions(id: number): Promise<MovieFunctionDto[] | null> {
    const movie = await repository.findById(id);
    if (!movie) return null;

    const functions = await repository.findFunctionsByMovieId(movie.id);
    const now = new Date();

    return (
      functions
        // RN-014: solo funciones futuras.
        .filter((fn) => fn.active && new Date(fn.dateTime) > now)
        .map((fn) => ({
          id: fn.id,
          dateTime: fn.dateTime.toString(),
          format: fn.format,
          room: fn.room,
          price: Number(fn.price),
          // RN-015: horario agotado si no hay sillas disponibles.
          soldOut: fn.availableSeats <= 0,
        }))
    );
  }

  async getMovieRecommendations(id: number): Promise<MovieRecommendationDto[] | null> {
    const movie = await repository.findById(id);
    if (!movie) return null;

    const similar = await repository.findByGenres(movie.genres, movie.id, RECOMMENDATIONS_LIMIT);

    return similar.map((m) => ({
      id: m.id,
      title: m.title,
      posterUrl: m.posterUrl,
      averageRating: Number(m.averageRating),
    }));
  }

  // --- Métodos de develop / HU-003 ---
  /**
   * Obtiene todas las películas activas en cartelera.
   */
  async findAll(): Promise<Movie[]> {
    return await repository.findAll();
  }

  /**
   * Obtiene las películas con funciones disponibles en los próximos 7 días.
   */
  async findWeekly(): Promise<Movie[]> {
    return await repository.findWeekly();
  }

  /**
   * Obtiene las películas con funciones disponibles el día de hoy.
   */
  async findToday(): Promise<Movie[]> {
    return await repository.findToday();
  }

  /**
   * Obtiene películas aplicando filtros opcionales.
   */
  async findByFilters(filters: FilterMoviesDto): Promise<Movie[]> {
    return await repository.findByFilters(filters);
  }
}

export default new MovieService();
