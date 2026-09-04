// app/src/controllers/movie.controller.ts

import { Request, Response } from 'express';

import { IMovieService } from '../services/interfaces/movie.service.interface.js';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto.js';
import { InvalidMovieIdError, InvalidCinemaFilterError } from '../errors/movie.errors.js';

import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Películas
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `Movie`:
 * cartelera, próximos estrenos, funciones, recomendaciones y filtros de búsqueda.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `MovieService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener y normalizar los parámetros de ruta y de consulta enviados por el cliente.
 *  - Invocar el servicio correspondiente.
 *  - Construir la respuesta HTTP.
 *  - Retornar los códigos de estado apropiados.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio.
 *  - Acceder directamente a la base de datos.
 *  - Ejecutar consultas mediante Sequelize.
 *  - Realizar validaciones complejas del dominio.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * MovieController
 *      │
 * MovieService
 *      │
 * MovieRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */
export class MovieController {
  /**
   * Servicio encargado de ejecutar la lógica de negocio relacionada con
   * las películas.
   */
  constructor(private readonly movieService: IMovieService) {}

  // --- Métodos de HU-004 ---

  /**
   * Obtiene el detalle completo de una película por su identificador.
   *
   * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
   * y retorna el detalle de la película.
   *
   * Corresponde a la HU-004 (detalle de película en cartelera).
   *
   * @async
   * @param {Request} req Objeto de la petición HTTP.
   * @param {Response} res Objeto de la respuesta HTTP.
   */
  public getMovieDetail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = this.parseMovieId(req);
    const movie = await this.movieService.getMovieDetail(id);
    res.status(200).json(movie);
  });

  /**
   * Obtiene las funciones (horarios y salas) disponibles para una película.
   *
   * Valida parámetros, delega la consulta al servicio (filtrando opcionalmente por ciudad)
   * y retorna el listado de funciones activas y futuras.
   *
   * Corresponde a la HU-004 (funciones por película).
   *
   * @async
   * @param {Request} req Objeto de la petición HTTP.
   * @param {Response} res Objeto de la respuesta HTTP.
   */
  public getMovieFunctions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = this.parseMovieId(req);
    const cityId = this.parseCityIdQuery(req);
    const functions = await this.movieService.getMovieFunctions(id, cityId);
    res.status(200).json(functions);
  });

  /**
   * Obtiene recomendaciones de películas similares a una película dada.
   *
   * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
   * y retorna el listado de películas recomendadas.
   *
   * Corresponde a la HU-004 (recomendaciones por película).
   *
   * @async
   * @param {Request} req Objeto de la petición HTTP.
   * @param {Response} res Objeto de la respuesta HTTP.
   */
  public getMovieRecommendations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = this.parseMovieId(req);
      const recommendations = await this.movieService.getMovieRecommendations(id);
      res.status(200).json(recommendations);
    },
  );

  // --- Métodos de HU-005 ---

  /**
   * Obtiene el listado de próximos estrenos.
   *
   * Delega la consulta a la capa de servicios, la cual será responsable de
   * aplicar cualquier regla de negocio antes de consultar el repositorio.
   *
   * Corresponde a la HU-005 (próximos estrenos).
   *
   * @async
   *
   * @param {Request} _req
   * Objeto de la petición HTTP.
   *
   * En este endpoint no se utiliza, por ello se antepone "_" al nombre de la
   * variable para indicar explícitamente que el parámetro es requerido por
   * Express pero no será utilizado.
   *
   * @param {Response} res
   * Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   *
   * - **200 OK**
   *   Listado de próximos estrenos obtenido correctamente.
   *
   * - **500 Internal Server Error**
   *   Error inesperado durante la consulta.
   */
  public getUpcomingMovies = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const movies = await this.movieService.findUpcoming();
    res.status(200).json(movies);
  });

  /**
   * Obtiene el detalle de un próximo estreno por su identificador.
   *
   * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
   * y retorna el detalle del próximo estreno si existe.
   *
   * Corresponde a la HU-005 (detalle de próximo estreno).
   *
   * @async
   *
   * @param {Request} req
   * Objeto de la petición HTTP.
   *
   * Espera recibir en params:
   * @example
   * GET /api/upcoming/42
   * req.params.id = "42"
   *
   * @param {Response} res
   * Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   *
   * - **200 OK**
   *   Detalle del próximo estreno obtenido correctamente.
   *
   * - **400 Bad Request**
   *   El id de la película es inválido (no numérico).
   *
   * - **404 Not Found**
   *   El próximo estreno no existe.
   *
   * - **500 Internal Server Error**
   *   Error inesperado durante la consulta.
   */
  public getUpcomingMovie = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = this.parseMovieId(req);
    const movie = await this.movieService.getUpcomingMovie(id);
    res.status(200).json(movie);
  });

  // ==========================================================================
  // --- Métodos de HU-003 (Cartelera y Filtros) ---
  // ==========================================================================

  /**
   * ==========================================================================
   * Obtiene el listado completo de películas activas en cartelera.
   * ==========================================================================
   *
   * Delega la consulta a la capa de servicios aplicando la regla RN-010.
   *
   * Corresponde a la HU-003 (consulta general de cartelera).
   *
   * @async
   *
   * @param {Request} _req Objeto de la petición HTTP (no utilizado en este endpoint).
   * @param {Response} res Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   * - **200 OK**: Listado de películas activas obtenido correctamente.
   * - **500 Internal Server Error**: Error inesperado durante el procesamiento.
   *
   * @security
   * - No expone detalles internos del motor de base de datos en las respuestas.
   */
  public getMovies = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const movies = await this.movieService.findAll();
    res.status(200).json(movies);
  });

  /**
   * ==========================================================================
   * Obtiene la cartelera de películas para la semana (próximos 7 días).
   * ==========================================================================
   *
   * Delega la consulta al servicio para obtener únicamente películas que
   * cuenten con funciones en la ventana de 7 días (RN-012).
   *
   * Corresponde a la HU-003 (cartelera semanal).
   *
   * @async
   *
   * @param {Request} _req Objeto de la petición HTTP.
   * @param {Response} res Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   * - **200 OK**: Listado de películas con funciones en los próximos 7 días.
   * - **500 Internal Server Error**: Error inesperado durante el procesamiento.
   */
  public getWeeklyMovies = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const movies = await this.movieService.findWeekly();
    res.status(200).json(movies);
  });

  /**
   * ==========================================================================
   * Obtiene las películas con funciones programadas para el día de hoy.
   * ==========================================================================
   *
   * Delega la consulta al servicio filtrando las funciones del día actual.
   *
   * Corresponde a la HU-003 (cartelera del día).
   *
   * @async
   *
   * @param {Request} _req Objeto de la petición HTTP.
   * @param {Response} res Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   * - **200 OK**: Listado de películas programadas para la fecha de hoy.
   * - **500 Internal Server Error**: Error inesperado durante el procesamiento.
   */
  public getTodayMovies = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const movies = await this.movieService.findToday();
    res.status(200).json(movies);
  });

  /**
   * ==========================================================================
   * Obtiene películas aplicando filtros de búsqueda multicriterio.
   * ==========================================================================
   *
   * Extrae los parámetros de consulta (`query params`), construye el DTO de filtros
   * mediante el método helper privado `parseFilterQueryParams` y delega la ejecución
   * al `MovieService`.
   *
   * Corresponde a la HU-003 (búsqueda con filtros de cartelera).
   *
   * @async
   *
   * @param {Request} req Objeto de la petición HTTP.
   *
   * Espera recibir en query (todos opcionales):
   * @example
   * GET /api/movies/filter?date=2026-08-24&genre=Acción&classification=PG-13&language=Español&format=2D&cinemaId=1&available=true
   *
   * @param {Response} res Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   * - **200 OK**: Listado de películas que cumplen los criterios de filtrado.
   * - **400 Bad Request**: Parámetros de filtro inválidos (fecha o ID de cine incorrectos).
   * - **500 Internal Server Error**: Error inesperado durante el procesamiento.
   *
   * @throws {InvalidMovieDateFilterError} Gestionado automáticamente por el middleware global.
   * @throws {InvalidCinemaFilterError} Gestionado automáticamente por el middleware global.
   */
  public getMoviesByFilter = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = this.parseFilterQueryParams(req);
    const movies = await this.movieService.findByFilters(filters);
    res.status(200).json(movies);
  });

  /**
   * Helper privado encargado de extraer y parsear el identificador numérico de película
   * desde los parámetros de ruta.
   *
   * @private
   * @param {Request} req Petición HTTP entrante.
   * @returns {number} Identificador numérico válido de la película.
   * @throws {InvalidMovieIdError} Si el parámetro no es numérico o no es un entero positivo.
   */
  private parseMovieId(req: Request): number {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw new InvalidMovieIdError();
    }

    return id;
  }

  /**
   * Helper privado encargado de extraer y validar opcionalmente el filtro de ciudad desde el query string.
   *
   * @private
   * @param {Request} req Petición HTTP entrante.
   * @returns {number | undefined} Identificador de ciudad o undefined si no fue provisto.
   * @throws {InvalidCinemaFilterError} Si el valor proporcionado no es un número válido.
   */
  private parseCityIdQuery(req: Request): number | undefined {
    if (req.query.cityId == null || req.query.cityId === '') {
      return undefined;
    }

    const cityId = Number(req.query.cityId);

    if (Number.isNaN(cityId) || !Number.isInteger(cityId) || cityId <= 0) {
      throw new InvalidCinemaFilterError('El identificador de ciudad proporcionado es inválido.');
    }

    return cityId;
  }

  /**
   * Helper privado encargado de extraer y parsear los parámetros de consulta
   * a la estructura `FilterMoviesDto`.
   *
   * @private
   *
   * @param {Request} req Petición HTTP entrante.
   *
   * @returns {FilterMoviesDto} DTO estructurado con los filtros recibidos.
   */
  private parseFilterQueryParams(req: Request): FilterMoviesDto {
    const rawCinemaId = req.query.cinemaId ? Number(req.query.cinemaId) : undefined;

    return {
      date: typeof req.query.date === 'string' ? req.query.date : undefined,
      genre: typeof req.query.genre === 'string' ? req.query.genre : undefined,
      classification:
        typeof req.query.classification === 'string' ? req.query.classification : undefined,
      language: typeof req.query.language === 'string' ? req.query.language : undefined,
      format: typeof req.query.format === 'string' ? req.query.format : undefined,
      cinemaId: rawCinemaId,
      available: req.query.available === 'true' ? true : undefined,
    };
  }
}
