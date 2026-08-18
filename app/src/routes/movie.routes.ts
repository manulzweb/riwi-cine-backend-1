import { Router } from 'express';
import {
  getMovies,
  getWeeklyMovies,
  getTodayMovies,
  getMoviesByFilter,
  getMovieDetail,
  getMovieFunctions,
  getMovieRecommendations,
  getUpcomingMovies,
} from '../controllers/movie.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints para la gestión de películas, cartelera semanal y detalles.
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Obtener todas las películas activas
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de películas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   synopsis:
 *                     type: string
 *                   duration:
 *                     type: integer
 *                   director:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', getMovies);

/**
 * @swagger
 * /api/movies/upcoming:
 *   get:
 *     summary: Obtener las películas en estado "Próximo Estreno"
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de próximos estrenos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   posterUrl:
 *                     type: string
 *                   releaseDate:
 *                     type: string
 *                     format: date
 *                   genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                   classification:
 *                     type: string
 *                   duration:
 *                     type: integer
 *                   trailerUrl:
 *                     type: string
 *                   synopsis:
 *                     type: string
 *                   daysUntil:
 *                     type: integer
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/upcoming', getUpcomingMovies);

/**
 * @swagger
 * /api/movies/weekly:
 *   get:
 *     summary: Obtener cartelera semanal (próximos 7 días) para la ubicación del usuario
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la ciudad para filtrar la cartelera.
 *     responses:
 *       200:
 *         description: Cartelera semanal obtenida exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/weekly', getWeeklyMovies);

/**
 * @swagger
 * /api/movies/today:
 *   get:
 *     summary: Obtener películas programadas para el día de hoy
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la ciudad.
 *     responses:
 *       200:
 *         description: Películas de hoy obtenidas exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/today', getTodayMovies);

/**
 * @swagger
 * /api/movies/filter:
 *   get:
 *     summary: Filtrar películas/funciones por criterios (Fecha, Género, Idioma, Formato, etc.)
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la ciudad.
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha a consultar (YYYY-MM-DD).
 *       - in: query
 *         name: genre
 *         required: false
 *         schema:
 *           type: string
 *         description: Género de la película.
 *       - in: query
 *         name: rating
 *         required: false
 *         schema:
 *           type: string
 *         description: Clasificación por edad.
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *         description: Idioma (Doblada/Subtitulada).
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *         description: Formato de sala (2D, 3D, IMAX, VIP).
 *       - in: query
 *         name: cinemaId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Complejo/cine específico.
 *       - in: query
 *         name: available
 *         required: false
 *         schema:
 *           type: string
 *         description: "Filtro 'Disponible' para ocultar agotados (true/false)."
 *     responses:
 *       200:
 *         description: Cartelera filtrada exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/filter', getMoviesByFilter);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Obtener el detalle completo de una película por su ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película.
 *     responses:
 *       200:
 *         description: Detalle de película obtenido correctamente.
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', getMovieDetail);

/**
 * @swagger
 * /api/movies/{id}/functions:
 *   get:
 *     summary: Obtener las funciones activas y futuras para una película
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película.
 *       - in: query
 *         name: cityId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la ciudad para filtrar funciones.
 *     responses:
 *       200:
 *         description: Funciones futuras obtenidas correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/functions', getMovieFunctions);

/**
 * @swagger
 * /api/movies/{id}/recommendations:
 *   get:
 *     summary: Obtener recomendaciones de películas similares
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película de referencia.
 *     responses:
 *       200:
 *         description: Recomendaciones de películas obtenidas exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/recommendations', getMovieRecommendations);

export default router;
