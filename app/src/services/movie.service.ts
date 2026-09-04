// app/src/services/movie.service.ts

import Movie from '../models/movie.model.js';
import CinemaFunction from '../models/function.model.js';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto.js';
import { IMovieService } from './interfaces/movie.service.interface.js';
import { IMovieRepository } from '../repositories/interfaces/movie.repository.interface.js';
import {
  MovieDetailDto,
  MovieFunctionDto,
  MovieRecommendationDto,
  PriceByFormatDto,
} from '../dto/response/movie-detail.dto.js';
import { UpcomingMovieDto } from '../dto/response/upcoming-movie.dto.js';
import {
  InvalidCinemaFilterError,
  InvalidMovieDateFilterError,
  MovieFilterValidationError,
  MovieNotFoundError,
} from '../errors/movie.errors.js';

/**
 * Límite máximo de películas similares devueltas como recomendaciones.
 *
 * @constant {number}
 */
const RECOMMENDATIONS_LIMIT = 6;

/**
 * Expresión regular para validar fechas en formato ISO YYYY-MM-DD.
 *
 * @constant {RegExp}
 */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con las películas (HU-003, HU-004 y HU-005).
 *
 * Responsabilidades:
 * - Exponer la cartelera completa, semanal (próximos 7 días) y del día actual (HU-003).
 * - Validar y aplicar filtros multicriterio sobre la cartelera (HU-003).
 * - Exponer el detalle completo de una película junto con sus precios por formato (HU-004).
 * - Exponer las funciones disponibles de una película aplicando reglas de negocio (HU-004).
 * - Generar recomendaciones de películas similares por género (HU-004).
 * - Exponer las películas en estado "Próximo Estreno" y su detalle (HU-005).
 * - Calcular los días restantes hasta el estreno de una película (HU-005).
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas al
 * correspondiente repository mediante Inyección de Dependencias.
 *
 * @class MovieService
 * @implements {IMovieService}
 *
 * @business
 * - RN-010: únicamente se muestran funciones y películas activas en cartelera.
 * - RN-011: no se muestran funciones agotadas cuando el usuario aplica el filtro "Disponible".
 * - RN-012: la cartelera semanal siempre abarca un periodo de siete (7) días.
 * - RN-014: únicamente se muestran funciones con fecha futura.
 * - RN-015: una función se considera agotada cuando no dispone de sillas disponibles.
 */
class MovieService implements IMovieService {
  constructor(private readonly movieRepository: IMovieRepository) {
    this.movieRepository = movieRepository;
  }

  // ==========================================================================
  // --- Métodos de HU-003 (Cartelera y Filtros) ---
  // ==========================================================================

  /**
   * Obtiene todas las películas activas en el catálogo general.
   *
   * @async
   *
   * @returns {Promise<Movie[]>}
   * Lista completa de películas activas en el sistema.
   *
   * @business
   * RN-010: garantiza que solo se consulten películas con estado activo.
   *
   * @example
   * ```ts
   * const movies = await movieService.findAll();
   * ```
   */
  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.findAll();
  }

  /**
   * Obtiene las películas que cuentan con funciones programadas en los próximos 7 días.
   *
   * @async
   *
   * @returns {Promise<Movie[]>}
   * Colección de películas con funciones activas dentro de la ventana de 7 días.
   *
   * @business
   * RN-012: La cartelera semanal siempre abarca los 7 días posteriores a partir de hoy.
   *
   * @example
   * ```ts
   * const weeklyMovies = await movieService.findWeekly();
   * ```
   */
  async findWeekly(): Promise<Movie[]> {
    return await this.movieRepository.findWeekly();
  }

  /**
   * Obtiene las películas que cuentan con funciones programadas para el día de hoy.
   *
   * @async
   *
   * @returns {Promise<Movie[]>}
   * Colección de películas con funciones activas para la fecha actual.
   *
   * @business
   * RN-010: Permite consultar de forma inmediata la cartelera correspondiente a la jornada actual.
   *
   * @example
   * ```ts
   * const todayMovies = await movieService.findToday();
   * ```
   */
  async findToday(): Promise<Movie[]> {
    return await this.movieRepository.findToday();
  }

  /**
   * Obtiene la cartelera de películas aplicando criterios de filtrado opcionales.
   *
   * Orquesta la validación y sanitización de los parámetros de entrada mediante
   * métodos auxiliares privados y delega la ejecución de la consulta al repositorio.
   *
   * @async
   *
   * @param {FilterMoviesDto} filters Criterios de filtrado (fecha, género, formato, idioma, cine, disponibilidad).
   *
   * @returns {Promise<Movie[]>} Lista de películas que coinciden con los filtros especificados.
   *
   * @throws {InvalidMovieDateFilterError} Si el formato de fecha no es YYYY-MM-DD o la fecha es inválida.
   * @throws {InvalidCinemaFilterError} Si el ID del cine no es un número entero positivo.
   * @throws {MovieFilterValidationError} Si alguno de los filtros textuales excede los límites permitidos.
   *
   * @business
   * - RN-010: Solo incluye funciones y películas activas.
   * - RN-011: Cuando `available` es true, excluye funciones sin disponibilidad de asientos.
   *
   * @example
   * ```ts
   * const filtered = await movieService.findByFilters({
   *   genre: 'Acción',
   *   format: 'IMAX',
   *   date: '2026-08-24',
   *   available: true,
   * });
   * ```
   */
  async findByFilters(filters: FilterMoviesDto): Promise<Movie[]> {
    // 1. Validar parámetros de filtro
    this.validateFilterDto(filters);

    // 2. Sanitizar filtros antes de enviarlos a la capa de persistencia
    const sanitizedFilters = this.sanitizeFilters(filters);

    // 3. Delegar consulta filtrada al repositorio
    return await this.movieRepository.findByFilters(sanitizedFilters);
  }

  // ==========================================================================
  // --- Métodos de HU-004 (Detalle, Funciones y Recomendaciones) ---
  // ==========================================================================

  /**
   * Obtiene el detalle completo de una película (HU-004).
   *
   * Valida la existencia de la película, extrae los precios por formato a partir
   * de sus funciones y construye el DTO de respuesta estructurado.
   *
   * @async
   * @param {number} id Identificador único de la película.
   * @returns {Promise<MovieDetailDto>} Detalle completo de la película.
   * @throws {MovieNotFoundError} Si la película no existe o no está activa.
   */
  async getMovieDetail(id: number): Promise<MovieDetailDto> {
    const movie = await this.getActiveMovieOrThrow(id);
    const functions = await this.movieRepository.findFunctionsByMovieId(movie.id);
    const pricesByFormat = this.extractPricesByFormat(functions);

    return this.toMovieDetailDto(movie, pricesByFormat);
  }

  /**
   * Obtiene las funciones disponibles de una película (HU-004).
   *
   * Aplica las reglas de negocio:
   * - RN-014: solo se incluyen funciones activas con fecha futura.
   * - RN-015: se marca como agotada la función sin sillas disponibles.
   * - Soporta filtrado opcional por ciudad.
   *
   * @async
   * @param {number} id Identificador único de la película.
   * @param {number} [cityId] Identificador opcional de la ciudad para filtrar funciones.
   * @returns {Promise<MovieFunctionDto[]>} Lista de funciones futuras disponibles.
   * @throws {MovieNotFoundError} Si la película no existe o no está activa.
   */
  async getMovieFunctions(id: number, cityId?: number): Promise<MovieFunctionDto[]> {
    const movie = await this.getActiveMovieOrThrow(id);
    const functions = await this.movieRepository.findFunctionsByMovieId(movie.id, cityId);
    const futureFunctions = this.filterFutureActiveFunctions(functions);

    return this.toMovieFunctionDtos(futureFunctions);
  }

  /**
   * Obtiene recomendaciones de películas similares a la indicada (HU-004).
   *
   * La similitud se determina por géneros compartidos y el resultado
   * se limita a `RECOMMENDATIONS_LIMIT` películas.
   *
   * @async
   * @param {number} id Identificador único de la película de referencia.
   * @returns {Promise<MovieRecommendationDto[]>} Lista de películas recomendadas.
   * @throws {MovieNotFoundError} Si la película no existe o no está activa.
   */
  async getMovieRecommendations(id: number): Promise<MovieRecommendationDto[]> {
    const movie = await this.getActiveMovieOrThrow(id);
    const genres = movie.genres || [];

    if (genres.length === 0) {
      return [];
    }

    const similar = await this.movieRepository.findByGenres(
      genres,
      movie.id,
      RECOMMENDATIONS_LIMIT,
    );

    return this.toMovieRecommendationDtos(similar);
  }

  // ==========================================================================
  // --- Métodos de HU-005 (Próximos Estrenos) ---
  // ==========================================================================

  /**
   * Obtiene las películas en estado "Próximo Estreno" (HU-005).
   *
   * @async
   *
   * @returns {Promise<UpcomingMovieDto[]>} Lista de próximos estrenos con días restantes calculados.
   */
  async findUpcoming(): Promise<UpcomingMovieDto[]> {
    const movies = await this.movieRepository.findUpcoming();
    return movies.map((m) => this.toUpcomingDto(m));
  }

  /**
   * Retorna el detalle de una película en estado "Próximo Estreno" (HU-005).
   *
   * @async
   * @param {number} id Identificador único de la película.
   * @returns {Promise<UpcomingMovieDto>} Detalle del próximo estreno.
   * @throws {MovieNotFoundError} Si el próximo estreno no existe o ya está en cartelera.
   */
  async getUpcomingMovie(id: number): Promise<UpcomingMovieDto> {
    const movie = await this.movieRepository.findUpcomingById(id);
    if (!movie) {
      throw new MovieNotFoundError('Próximo estreno no encontrado.');
    }

    return this.toUpcomingDto(movie);
  }

  // ==========================================================================
  // --- Métodos Privados / Helpers de Dominio (SRP) ---
  // ==========================================================================

  /**
   * Valida la estructura global de los filtros de películas.
   *
   * @private
   *
   * @param {FilterMoviesDto} filters Objeto con los filtros a validar.
   *
   * @throws {InvalidMovieDateFilterError} Si la fecha es inválida o tiene formato incorrecto.
   * @throws {InvalidCinemaFilterError} Si el ID de cine es inválido.
   * @throws {MovieFilterValidationError} Si los textos de filtrado son inválidos.
   */
  private validateFilterDto(filters: FilterMoviesDto): void {
    if (!filters) return;

    if (filters.date != null) {
      this.validateDate(filters.date);
    }

    if (filters.cinemaId != null) {
      this.validateCinemaId(filters.cinemaId);
    }

    if (filters.genre) {
      this.validateTextFilter(filters.genre, 'género');
    }

    if (filters.classification) {
      this.validateTextFilter(filters.classification, 'clasificación');
    }

    if (filters.language) {
      this.validateTextFilter(filters.language, 'idioma');
    }

    if (filters.format) {
      this.validateTextFilter(filters.format, 'formato');
    }
  }

  /**
   * Valida que la fecha de filtrado cumpla con el formato `YYYY-MM-DD` y corresponda a una fecha real del calendario.
   *
   * @private
   *
   * @param {string} dateStr Cadena con la fecha a verificar.
   *
   * @throws {InvalidMovieDateFilterError} Si la fecha no cumple el formato o no es válida.
   */
  private validateDate(dateStr: string): void {
    const trimmedDate = dateStr.trim();

    if (!ISO_DATE_REGEX.test(trimmedDate)) {
      throw new InvalidMovieDateFilterError();
    }

    const parsedDate = new Date(`${trimmedDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvalidMovieDateFilterError();
    }

    // Validar coherencia de componentes (evita fechas como 2026-02-31)
    const [year, month, day] = trimmedDate.split('-').map(Number);
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new InvalidMovieDateFilterError('La fecha proporcionada no existe en el calendario.');
    }
  }

  /**
   * Valida que el identificador del cine sea un número entero positivo.
   *
   * @private
   *
   * @param {number} cinemaId Identificador a validar.
   *
   * @throws {InvalidCinemaFilterError} Si el ID no es entero o es menor o igual a cero.
   */
  private validateCinemaId(cinemaId: number): void {
    if (!Number.isInteger(cinemaId) || cinemaId <= 0) {
      throw new InvalidCinemaFilterError();
    }
  }

  /**
   * Valida la longitud y caracteres de los campos de texto de filtro.
   *
   * @private
   *
   * @param {string} value Valor del texto de filtro.
   * @param {string} fieldName Nombre del campo para el mensaje de error.
   *
   * @throws {MovieFilterValidationError} Si el valor supera la longitud máxima permitida (100 caracteres).
   */
  private validateTextFilter(value: string, fieldName: string): void {
    if (typeof value !== 'string' || value.trim().length > 100) {
      throw new MovieFilterValidationError(
        `El filtro de ${fieldName} no puede exceder los 100 caracteres.`,
      );
    }
  }

  /**
   * Sanitiza y normaliza los filtros de películas para la consulta.
   *
   * @private
   *
   * @param {FilterMoviesDto} filters Filtros de entrada.
   *
   * @returns {FilterMoviesDto} Filtros con cadenas limpias de espacios en blanco.
   */
  private sanitizeFilters(filters: FilterMoviesDto): FilterMoviesDto {
    return {
      date: filters.date ? filters.date.trim() : undefined,
      genre: filters.genre ? filters.genre.trim() : undefined,
      classification: filters.classification ? filters.classification.trim() : undefined,
      language: filters.language ? filters.language.trim() : undefined,
      format: filters.format ? filters.format.trim() : undefined,
      cinemaId: filters.cinemaId,
      available: filters.available,
    };
  }

  /**
   * Transforma una película en su DTO de próximo estreno.
   *
   * @private
   *
   * @param {Movie} movie Película a transformar.
   *
   * @returns {UpcomingMovieDto} DTO del próximo estreno listo para ser expuesto por la API.
   */
  private toUpcomingDto(movie: Movie): UpcomingMovieDto {
    return {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate.toString().slice(0, 10),
      genres: movie.genres,
      classification: movie.classification,
      duration: movie.duration,
      trailerUrl: movie.trailerUrl || '',
      synopsis: movie.synopsis,
      daysUntil: this.daysUntil(movie.releaseDate),
    };
  }

  /**
   * Calcula los días completos que faltan desde hoy hasta la fecha indicada.
   *
   * @private
   *
   * @param {Date} releaseDate Fecha de estreno de la película.
   *
   * @returns {number} Número de días restantes para el estreno; nunca negativo.
   */
  private daysUntil(releaseDate: Date): number {
    const release = new Date(
      releaseDate.getFullYear(),
      releaseDate.getMonth(),
      releaseDate.getDate(),
    ).getTime();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return Math.max(0, Math.ceil((release - today) / 86_400_000));
  }

  /**
   * Helper privado que busca una película activa o lanza MovieNotFoundError (Fail-Fast).
   *
   * @private
   * @param {number} id Identificador de la película.
   * @returns {Promise<Movie>} Película activa encontrada.
   * @throws {MovieNotFoundError} Si la película no existe o no está activa.
   */
  private async getActiveMovieOrThrow(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new MovieNotFoundError();
    }
    return movie;
  }

  /**
   * Extrae y agrupa el precio por cada formato único disponible en las funciones.
   *
   * @private
   * @param {CinemaFunction[]} functions Listado de funciones de la película.
   * @returns {PriceByFormatDto[]} Lista de precios por formato.
   */
  private extractPricesByFormat(functions: CinemaFunction[]): PriceByFormatDto[] {
    const pricesByFormat: PriceByFormatDto[] = [];
    const seenFormats = new Set<string>();

    for (const fn of functions) {
      if (fn.format && !seenFormats.has(fn.format)) {
        seenFormats.add(fn.format);
        pricesByFormat.push({
          format: fn.format,
          price: Number(fn.price),
        });
      }
    }

    return pricesByFormat;
  }

  /**
   * Mapea el modelo Movie y sus precios al DTO estructurado de detalle.
   *
   * @private
   * @param {Movie} movie Modelo de película.
   * @param {PriceByFormatDto[]} pricesByFormat Precios agrupados por formato.
   * @returns {MovieDetailDto} DTO de detalle de la película.
   */
  private toMovieDetailDto(movie: Movie, pricesByFormat: PriceByFormatDto[]): MovieDetailDto {
    return {
      id: movie.id,
      title: movie.title,
      synopsis: movie.synopsis,
      director: movie.director,
      actors: movie.actors || [],
      genres: movie.genres || [],
      languages: movie.languages || [],
      formats: movie.formats || [],
      duration: movie.duration,
      classification: movie.classification,
      releaseDate: movie.releaseDate.toString(),
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl || '',
      averageRating: movie.averageRating,
      pricesByFormat,
    };
  }

  /**
   * Filtra únicamente las funciones activas cuya fecha y hora sea futura (RN-014).
   *
   * @private
   * @param {CinemaFunction[]} functions Listado de funciones.
   * @returns {CinemaFunction[]} Funciones activas y futuras.
   */
  private filterFutureActiveFunctions(functions: CinemaFunction[]): CinemaFunction[] {
    const now = Date.now();
    return functions.filter((fn) => {
      const isActive = fn.isActive !== false && fn.active !== false;
      const isFuture = fn.startTime && new Date(fn.startTime).getTime() > now;
      return isActive && isFuture;
    });
  }

  /**
   * Transforma las funciones de la película a sus DTOs correspondientes (RN-015).
   *
   * @private
   * @param {CinemaFunction[]} functions Funciones activas y futuras.
   * @returns {MovieFunctionDto[]} DTOs de funciones con indicación de disponibilidad.
   */
  private toMovieFunctionDtos(functions: CinemaFunction[]): MovieFunctionDto[] {
    return functions.map((fn) => ({
      id: fn.id,
      dateTime: fn.startTime ? new Date(fn.startTime).toISOString() : '',
      format: fn.format || '',
      room: fn.room || '',
      price: fn.price,
      soldOut: (fn.availableSeats ?? 0) <= 0,
    }));
  }

  /**
   * Transforma una lista de películas al formato de recomendación.
   *
   * @private
   * @param {Movie[]} movies Películas recomendadas.
   * @returns {MovieRecommendationDto[]} DTOs de películas recomendadas.
   */
  private toMovieRecommendationDtos(movies: Movie[]): MovieRecommendationDto[] {
    return movies.map((m) => ({
      id: m.id,
      title: m.title,
      posterUrl: m.posterUrl,
      averageRating: m.averageRating,
    }));
  }
}

export default MovieService;
