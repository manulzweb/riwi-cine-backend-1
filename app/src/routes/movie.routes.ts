// app/src/routes/movie.routes.ts

/**
 * Rutas de Película (HU-004)
 * ---------------------------
 * Endpoints:
 *  - GET /api/movies/:id                 -> Detalle completo
 *  - GET /api/movies/:id/functions        -> Funciones futuras disponibles
 *  - GET /api/movies/:id/recommendations  -> Películas recomendadas
 */

import { Router } from "express";
import {
  getMovieDetail,
  getMovieFunctions,
  getMovieRecommendations,
} from "../controllers/movie.controller";

const router = Router();

/**
 * GET /:id
 * --------
 * Retorna el detalle completo de una película.
 *
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Obtener el detalle de una película
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalle de la película obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               title: "Guardianes del Tiempo"
 *               synopsis: "Un grupo de exploradores debe viajar entre líneas temporales..."
 *               director: "Ana Restrepo"
 *               actors: ["Carlos Mora", "Lucía Fernández"]
 *               genres: ["Ciencia Ficción", "Aventura"]
 *               languages: ["Español", "Subtitulada"]
 *               formats: ["2D", "3D", "IMAX"]
 *               duration: 128
 *               classification: "PG-13"
 *               releaseDate: "2026-08-01"
 *               posterUrl: "https://picsum.photos/seed/movie1/400/600"
 *               bannerUrl: "https://picsum.photos/seed/movie1-banner/1200/500"
 *               trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *               averageRating: 4.5
 *               pricesByFormat:
 *                 - format: "2D"
 *                   price: 12000
 *                 - format: "IMAX"
 *                   price: 22000
 *       404:
 *         description: Película no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               error: "Película no encontrada."
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id", getMovieDetail);

/**
 * GET /:id/functions
 * -------------------
 * Retorna las funciones futuras disponibles para una película (RN-014),
 * marcando cuáles están agotadas (RN-015).
 *
 * @swagger
 * /api/movies/{id}/functions:
 *   get:
 *     summary: Obtener las funciones disponibles de una película
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de funciones futuras de la película.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 dateTime: "2026-08-12T03:02:24.000Z"
 *                 format: "2D"
 *                 room: "Sala 1"
 *                 price: 12000
 *                 soldOut: false
 *               - id: 2
 *                 dateTime: "2026-08-12T03:02:24.000Z"
 *                 format: "IMAX"
 *                 room: "Sala IMAX"
 *                 price: 22000
 *                 soldOut: true
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id/functions", getMovieFunctions);

/**
 * GET /:id/recommendations
 * -------------------------
 * Retorna películas similares recomendadas por género.
 *
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de películas recomendadas.
 *         content:
 *           application/json:
 *             example:
 *               - id: 3
 *                 title: "Estrella Fugaz"
 *                 posterUrl: "https://picsum.photos/seed/movie3/400/600"
 *                 averageRating: 4.8
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id/recommendations", getMovieRecommendations);

export default router;