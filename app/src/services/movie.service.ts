// app/src/services/movie.service.ts

import Movie from '../models/movie.model';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto';
import repository from '../repositories/movie.repository';
import { IMovieService } from './interfaces/movie.service.interface';
import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
  PriceByFormatDto,
} from '../dto/response/movie-detail.dto';
import { UpcomingMovieDto } from '../dto/response/upcoming-movie.dto';

/**
 * Límite máximo de películas similares devueltas como recomendaciones.
 *
 * @constant {number}
 */
const RECOMMENDATIONS_LIMIT = 6;

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con las películas (HU-003 y HU-004).
 *
 * Responsabilidades:
 * - Exponer el detalle completo de una película junto con sus precios por formato.
 * - Exponer las funciones disponibles de una película aplicando reglas de negocio.
 * - Generar recomendaciones de películas similares por género.
 * - Exponer las películas en estado "Próximo Estreno" y su detalle (HU-005).
 * - Exponer catálogos de cartelera: todas, semanales y del día.
 * - Aplicar filtros de búsqueda sobre el catálogo de películas.
 * - Calcular los días restantes hasta el estreno de una película.
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas al
 * correspondiente repository.
 *
 * @class MovieService
 *
 * @business
 * - RN-014: únicamente se muestran funciones con fecha futura.
 * - RN-015: una función se considera agotada cuando no dispone
 *   de sillas disponibles.
 */
class MovieService implements IMovieService {
  // --- Métodos de HU-004 ---

  /**
   * Obtiene el detalle completo de una película (HU-004).
   *
   * Además de los datos generales de la película, calcula el precio
   * por cada formato disponible a partir de sus funciones. Para cada
   * formato se toma el precio de la primera función encontrada.
   *
   * @param {number} id
   * Identificador único de la película.
   *
   * @returns {Promise<MovieDetailDto | null>}
   * Detalle completo de la película, o `null` cuando no existe.
   */
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

  /**
   * Obtiene las funciones disponibles de una película (HU-004).
   *
   * Aplica las reglas de negocio:
   * - RN-014: solo se incluyen funciones activas con fecha futura.
   * - RN-015: se marca como agotada la función sin sillas disponibles.
   *
   * @param {number} id
   * Identificador único de la película.
   *
   * @returns {Promise<MovieFunctionDto[] | null>}
   * Lista de funciones futuras disponibles, o `null` cuando la
   * película no existe.
   */
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

  /**
   * Obtiene recomendaciones de películas similares a la indicada.
   *
   * La similitud se determina por géneros compartidos y el resultado
   * se limita a `RECOMMENDATIONS_LIMIT` películas.
   *
   * @param {number} id
   * Identificador único de la película de referencia.
   *
   * @returns {Promise<MovieRecommendationDto[] | null>}
   * Lista resumida de películas recomendadas, o `null` cuando la
   * película de referencia no existe.
   */
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
   * Obtiene las películas en estado "Próximo Estreno" (HU-005).
   *
   * La consulta es delegada al repositorio y cada película se
   * transforma a su DTO correspondiente, incluyendo los días
   * restantes para su estreno.
   *
   * @returns {Promise<UpcomingMovieDto[]>}
   * Lista de próximos estrenos.
   */
  async findUpcoming(): Promise<UpcomingMovieDto[]> {
    const movies = await repository.findUpcoming();
    return movies.map((m) => this.toUpcomingDto(m));
  }

  /**
   * Retorna el detalle de una película en estado "Próximo Estreno" (HU-005).
   *
   * @param {number} id
   * Identificador único de la película.
   *
   * @returns {Promise<UpcomingMovieDto | null>}
   * Detalle del próximo estreno, o `null` cuando la película no existe
   * o no se encuentra en estado "Próximo Estreno".
   */
  async getUpcomingMovie(id: number): Promise<UpcomingMovieDto | null> {
    const movie = await repository.findUpcomingById(id);
    if (!movie) return null;

    return this.toUpcomingDto(movie);
  }

  /**
   * Obtiene todas las películas activas en cartelera.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @returns {Promise<Movie[]>}
   * Lista de películas activas en cartelera.
   */
  async findAll(): Promise<Movie[]> {
    return await repository.findAll();
  }

  /**
   * Obtiene las películas con funciones disponibles en los próximos 7 días.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @returns {Promise<Movie[]>}
   * Lista de películas con funciones durante la semana en curso.
   */
  async findWeekly(): Promise<Movie[]> {
    return await repository.findWeekly();
  }

  /**
   * Obtiene las películas con funciones disponibles el día de hoy.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @returns {Promise<Movie[]>}
   * Lista de películas con funciones el día actual.
   */
  async findToday(): Promise<Movie[]> {
    return await repository.findToday();
  }

  /**
   * Obtiene películas aplicando filtros opcionales.
   *
   * Los filtros disponibles son definidos por `FilterMoviesDto`
   * (género, formato, idioma, clasificación, entre otros) y su
   * interpretación es responsabilidad del repositorio.
   *
   * @param {FilterMoviesDto} filters
   * Criterios de filtrado opcionales proporcionados por el cliente.
   *
   * @returns {Promise<Movie[]>}
   * Lista de películas que cumplen los filtros aplicados.
   */
  async findByFilters(filters: FilterMoviesDto): Promise<Movie[]> {
    return await repository.findByFilters(filters);
  }

  /**
   * Transforma una película en su DTO de próximo estreno.
   *
   * Normaliza la fecha de estreno al formato `YYYY-MM-DD`, provee un
   * trailer vacío cuando no existe y calcula los días restantes
   * hasta el estreno.
   *
   * @param {Movie} m
   * Película a transformar.
   *
   * @returns {UpcomingMovieDto}
   * DTO del próximo estreno listo para ser expuesto por la API.
   */
  private toUpcomingDto(m: Movie): UpcomingMovieDto {
    return {
      id: m.id,
      title: m.title,
      posterUrl: m.posterUrl,
      releaseDate: m.releaseDate.toString().slice(0, 10),
      genres: m.genres,
      classification: m.classification,
      duration: m.duration,
      trailerUrl: m.trailerUrl || '',
      synopsis: m.synopsis,
      daysUntil: this.daysUntil(m.releaseDate),
    };
  }

  /**
   * Calcula los días completos que faltan desde hoy hasta la fecha indicada.
   *
   * La comparación se realiza sobre fechas truncadas a medianoche para
   * descontar la franja horaria. Si la fecha ya pasó o es hoy, retorna `0`.
   *
   * @param {Date} releaseDate
   * Fecha de estreno de la película.
   *
   * @returns {number}
   * Número de días restantes para el estreno; nunca negativo.
   */
  private daysUntil(releaseDate: Date): number {
    const value = releaseDate.toString().slice(0, 10);
    const [year, month, day] = value.split('-').map(Number);
    const release = new Date(year, month - 1, day).getTime();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.max(0, Math.ceil((release - today) / 86_400_000));
  }
}

/**
 * Instancia única del servicio de películas utilizada por la aplicación.
 *
 * @constant
 * @type {MovieService}
 */
export default new MovieService();
