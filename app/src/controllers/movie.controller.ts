// app/src/controllers/movie.controller.ts

import { Request, Response } from 'express';
import movieService from '../services/movie.service';
import { FilterMoviesDto } from '../dto/request/filter-movies.dto';

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
 * MovieRepository / FunctionRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

// --- Métodos de HU-004 ---

/**
 * Obtiene el detalle completo de una película por su identificador.
 *
 * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
 * y retorna el detalle de la película si existe.
 *
 * Corresponde a la HU-004 (detalle de película en cartelera).
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en params:
 * @example
 * GET /api/movies/42
 * req.params.id = "42"
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Detalle de la película obtenido correctamente.
 *
 * - **400 Bad Request**
 *   El id de la película es inválido (no numérico).
 *
 * - **404 Not Found**
 *   La película no existe.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getMovieDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const movie = await movieService.getMovieDetail(id);

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(movie);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

/**
 * Obtiene las funciones (horarios y salas) disponibles para una película.
 *
 * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
 * y retorna el listado de funciones asociadas a la película.
 *
 * Corresponde a la HU-004 (funciones por película).
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en params:
 * @example
 * GET /api/movies/42/functions
 * req.params.id = "42"
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de funciones obtenido correctamente.
 *
 * - **400 Bad Request**
 *   El id de la película es inválido (no numérico).
 *
 * - **404 Not Found**
 *   La película no existe.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getMovieFunctions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const functions = await movieService.getMovieFunctions(id);

    if (!functions) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(functions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

/**
 * Obtiene recomendaciones de películas similares a una película dada.
 *
 * Valida que el parámetro de ruta sea numérico, delega la consulta al servicio
 * y retorna el listado de películas recomendadas.
 *
 * Corresponde a la HU-004 (recomendaciones por película).
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en params:
 * @example
 * GET /api/movies/42/recommendations
 * req.params.id = "42"
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de recomendaciones obtenido correctamente.
 *
 * - **400 Bad Request**
 *   El id de la película es inválido (no numérico).
 *
 * - **404 Not Found**
 *   La película no existe.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getMovieRecommendations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const recommendations = await movieService.getMovieRecommendations(id);

    if (!recommendations) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(recommendations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

// --- Métodos de HU-005 ---
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
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de próximos estrenos obtenido correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getUpcomingMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findUpcoming();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

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
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
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
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getUpcomingMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const movie = await movieService.getUpcomingMovie(id);

    if (!movie) {
      return res.status(404).json({ error: 'Próximo estreno no encontrado.' });
    }

    return res.status(200).json(movie);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

// --- Métodos de develop / HU-003 ---

/**
 * Obtiene el listado completo de películas.
 *
 * Delega la consulta a la capa de servicios, la cual será responsable de
 * aplicar cualquier regla de negocio antes de consultar el repositorio.
 *
 * Corresponde a la HU-003 (consulta de cartelera).
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
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de películas obtenido correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findAll();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

/**
 * Obtiene las películas de la cartelera de la semana.
 *
 * Delega la consulta a la capa de servicios, la cual será responsable de
 * aplicar cualquier regla de negocio antes de consultar el repositorio.
 *
 * Corresponde a la HU-003 (cartelera semanal).
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
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de películas de la semana obtenido correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getWeeklyMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findWeekly();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

/**
 * Obtiene las películas de la cartelera del día actual.
 *
 * Delega la consulta a la capa de servicios, la cual será responsable de
 * aplicar cualquier regla de negocio antes de consultar el repositorio.
 *
 * Corresponde a la HU-003 (cartelera diaria).
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
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de películas del día obtenido correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getTodayMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findToday();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

/**
 * Obtiene películas aplicando filtros de búsqueda.
 *
 * Construye el DTO de filtros a partir de los parámetros de consulta
 * enviados por el cliente y delega la búsqueda filtrada al servicio.
 *
 * Corresponde a la HU-003 (búsqueda con filtros).
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en query (todos opcionales):
 * @example
 * GET /api/movies/filter?date=2026-08-24&genre=Acción&classification=PG-13&language=Español&format=2D&cinemaId=1&available=true
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Listado de películas filtradas obtenido correctamente (puede ser vacío).
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getMoviesByFilter = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters: FilterMoviesDto = {
      date: req.query.date as string,
      genre: req.query.genre as string,
      classification: req.query.classification as string,
      language: req.query.language as string,
      format: req.query.format as string,
      cinemaId: req.query.cinemaId ? Number(req.query.cinemaId) : undefined,
      available: req.query.available === 'true' ? true : undefined,
    };

    const movies = await movieService.findByFilters(filters);
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};
