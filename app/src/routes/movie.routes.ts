// app/src/routes/movie.routes.ts

/**
 * Rutas de Películas
 * ------------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `Movie`.
 *
 * Endpoints disponibles:
 *  - `GET /movies/`        : Obtener todas las películas activas.
 *  - `GET /movies/weekly`  : Obtener la cartelera de los próximos 7 días.
 *  - `GET /movies/today`   : Obtener las películas disponibles hoy.
 *  - `GET /movies/filter`  : Obtener películas con filtros opcionales.
 *
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from "express";
import {
  getMovies,
  getWeeklyMovies,
  getTodayMovies,
  getMoviesByFilter,
} from "../controllers/movie.controller";

const router = Router();

/**
 * GET /
 * -----
 * Obtiene todas las películas activas en cartelera.
 *
 * Response:
 *  - 200 OK: Devuelve un array de películas en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Obtener todas las películas activas
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de películas obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 title: "Spider-Man: No Way Home"
 *                 synopsis: "Peter Parker enfrenta las consecuencias de su identidad revelada."
 *                 genre: "Acción"
 *                 classification: "PG-13"
 *                 duration: 148
 *                 director: "Jon Watts"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/spiderman.jpg"
 *                 trailerUrl: "https://youtube.com/watch?v=JfVOs4VSpmA"
 *                 releaseDate: "2021-12-17"
 *                 rating: 8.3
 *                 isActive: true
 *               - id: 2
 *                 title: "Avatar: El camino del agua"
 *                 synopsis: "Jake Sully y Neytiri forman una familia y enfrentan una nueva amenaza."
 *                 genre: "Ciencia ficción"
 *                 classification: "PG-13"
 *                 duration: 192
 *                 director: "James Cameron"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/avatar2.jpg"
 *                 trailerUrl: "https://youtube.com/watch?v=a8Gx8wiNbs8"
 *                 releaseDate: "2022-12-16"
 *                 rating: 7.6
 *                 isActive: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las películas"
 */
router.get("/", getMovies);

/**
 * GET /weekly
 * -----------
 * Obtiene las películas con funciones disponibles en los próximos 7 días.
 *
 * Response:
 *  - 200 OK: Devuelve un array de películas de la semana.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/movies/weekly:
 *   get:
 *     summary: Obtener la cartelera semanal (próximos 7 días)
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Cartelera semanal obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 title: "Spider-Man: No Way Home"
 *                 genre: "Acción"
 *                 classification: "PG-13"
 *                 duration: 148
 *                 director: "Jon Watts"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/spiderman.jpg"
 *                 releaseDate: "2021-12-17"
 *                 rating: 8.3
 *                 isActive: true
 *               - id: 3
 *                 title: "Top Gun: Maverick"
 *                 genre: "Acción"
 *                 classification: "PG-13"
 *                 duration: 130
 *                 director: "Joseph Kosinski"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/topgun.jpg"
 *                 releaseDate: "2022-05-27"
 *                 rating: 8.3
 *                 isActive: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la cartelera semanal"
 */
router.get("/weekly", getWeeklyMovies);

/**
 * GET /today
 * ----------
 * Obtiene las películas con funciones disponibles el día de hoy.
 *
 * Response:
 *  - 200 OK: Devuelve un array de películas disponibles hoy.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/movies/today:
 *   get:
 *     summary: Obtener las películas disponibles hoy
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Películas de hoy obtenidas exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 title: "Spider-Man: No Way Home"
 *                 genre: "Acción"
 *                 classification: "PG-13"
 *                 duration: 148
 *                 director: "Jon Watts"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/spiderman.jpg"
 *                 releaseDate: "2021-12-17"
 *                 rating: 8.3
 *                 isActive: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las películas de hoy"
 */
router.get("/today", getTodayMovies);

/**
 * GET /filter
 * -----------
 * Obtiene películas aplicando filtros opcionales por query string.
 *
 * Query Params (todos opcionales):
 *  - `date`           : Fecha específica (YYYY-MM-DD)
 *  - `genre`          : Género de la película
 *  - `classification` : Clasificación de edad
 *  - `language`       : Idioma
 *  - `format`         : Formato de sala (2D, 3D, IMAX, VIP)
 *  - `cinemaId`       : ID del complejo de cine
 *  - `available`      : true para excluir funciones agotadas
 *
 * Response:
 *  - 200 OK: Devuelve un array de películas filtradas.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/movies/filter:
 *   get:
 *     summary: Obtener películas con filtros opcionales
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Fecha específica en formato YYYY-MM-DD
 *         example: "2026-08-05"
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Género de la película
 *         example: "Acción"
 *       - in: query
 *         name: classification
 *         schema:
 *           type: string
 *         description: Clasificación de edad
 *         example: "PG-13"
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Idioma de la película
 *         example: "Inglés"
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *         description: Formato de sala (2D, 3D, IMAX, VIP)
 *         example: "IMAX"
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: integer
 *         description: ID del complejo de cine
 *         example: 1
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Si es true, excluye funciones sin asientos disponibles
 *         example: true
 *     responses:
 *       200:
 *         description: Películas filtradas obtenidas exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 title: "Spider-Man: No Way Home"
 *                 genre: "Acción"
 *                 classification: "PG-13"
 *                 duration: 148
 *                 director: "Jon Watts"
 *                 language: "Inglés"
 *                 isSubtitled: true
 *                 posterUrl: "https://example.com/spiderman.jpg"
 *                 releaseDate: "2021-12-17"
 *                 rating: 8.3
 *                 isActive: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las películas filtradas"
 */
router.get("/filter", getMoviesByFilter);

export default router;
