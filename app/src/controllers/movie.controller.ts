// app/src/controllers/movie.controller.ts

import { Request, Response } from "express";
import movieService from "../services/movie.service";
import { FilterMoviesDto } from "../dto/filter-movies.dto";

/**
 * ============================================================================
 * Controlador de Películas
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `Movie`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `MovieService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente.
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

/**
 * Obtiene todas las películas activas en cartelera.
 *
 * @async
 *
 * @param {Request} _req
 * Objeto de la petición HTTP. No se utiliza en este endpoint.
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
 *   Lista de películas obtenida correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @example
 * [
 *   {
 *     "id": 1,
 *     "title": "Spider-Man: No Way Home",
 *     "genre": "Acción",
 *     "classification": "PG-13",
 *     "duration": 148,
 *     "isActive": true
 *   }
 * ]
 */
export const getMovies = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const movies = await movieService.findAll();
    return res.status(200).json(movies);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Obtiene las películas con funciones disponibles en los próximos 7 días.
 *
 * Aplica la regla de negocio RN-012: la cartelera siempre cubre
 * exactamente siete días contados desde el día actual.
 *
 * @async
 *
 * @param {Request} _req
 * Objeto de la petición HTTP. No se utiliza en este endpoint.
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
 *   Cartelera semanal obtenida correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 */
export const getWeeklyMovies = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const movies = await movieService.findWeekly();
    return res.status(200).json(movies);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Obtiene las películas con funciones disponibles el día de hoy.
 *
 * @async
 *
 * @param {Request} _req
 * Objeto de la petición HTTP. No se utiliza en este endpoint.
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
 *   Películas de hoy obtenidas correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 */
export const getTodayMovies = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const movies = await movieService.findToday();
    return res.status(200).json(movies);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Obtiene películas aplicando filtros opcionales enviados por el cliente.
 *
 * Los filtros se reciben por query string. Todos son opcionales.
 * Si no se envía ninguno, retorna todas las películas activas.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Query params opcionales:
 * @example
 * GET /api/movies/filter?genre=Acción&available=true&format=IMAX
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
 *   Películas filtradas obtenidas correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 */
export const getMoviesByFilter = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Construcción del DTO desde los query params recibidos por el cliente.
    const filters: FilterMoviesDto = {
      date: req.query.date as string,
      genre: req.query.genre as string,
      classification: req.query.classification as string,
      language: req.query.language as string,
      format: req.query.format as string,
      cinemaId: req.query.cinemaId ? Number(req.query.cinemaId) : undefined,
      available: req.query.available === "true" ? true : undefined,
    };

    const movies = await movieService.findByFilters(filters);
    return res.status(200).json(movies);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
