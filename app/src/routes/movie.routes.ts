import { Router } from 'express';
import {
  getMovies,
  getWeeklyMovies,
  getTodayMovies,
  getMoviesByFilter,
  getMovieDetail,
  getMovieFunctions,
  getMovieRecommendations,
} from '../controllers/movie.controller';

const router = Router();

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Obtener todas las películas activas
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de películas
 */
router.get('/', getMovies);

/**
 * @swagger
 * /api/movies/weekly:
 *   get:
 *     summary: Películas con funciones en los próximos 7 días
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de películas
 */
router.get('/weekly', getWeeklyMovies);

/**
 * @swagger
 * /api/movies/today:
 *   get:
 *     summary: Películas con funciones hoy
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de películas
 */
router.get('/today', getTodayMovies);

/**
 * @swagger
 * /api/movies/filter:
 *   get:
 *     summary: Filtrar películas
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *       - in: query
 *         name: classification
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Películas filtradas
 */
router.get('/filter', getMoviesByFilter);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Detalle de película
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la película
 *       404:
 *         description: Película no encontrada
 */
router.get('/:id', getMovieDetail);

/**
 * @swagger
 * /api/movies/{id}/functions:
 *   get:
 *     summary: Funciones de una película
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de funciones
 *       404:
 *         description: Película no encontrada
 */
router.get('/:id/functions', getMovieFunctions);

/**
 * @swagger
 * /api/movies/{id}/recommendations:
 *   get:
 *     summary: Películas recomendadas
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Películas recomendadas por género
 *       404:
 *         description: Película no encontrada
 */
router.get('/:id/recommendations', getMovieRecommendations);

export default router;
