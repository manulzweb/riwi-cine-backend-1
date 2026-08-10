// app/src/controllers/movie.controller.ts

import { Request, Response } from "express";
import movieService from "../services/movie.service";

/**
 * Controlador de Películas (HU-004)
 * ----------------------------------
 * Traduce peticiones HTTP a llamadas al MovieService. No contiene
 * reglas de negocio ni acceso a Sequelize.
 */

/**
 * GET /api/movies/:id
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
 *     responses:
 *       200:
 *         description: Detalle de la película obtenido correctamente.
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const getMovieDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "El id de la película es inválido." });
    }

    const movie = await movieService.getMovieDetail(id);

    if (!movie) {
      return res.status(404).json({ error: "Película no encontrada." });
    }

    return res.status(200).json(movie);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/movies/:id/functions
 * Retorna las funciones futuras disponibles para una película.
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
 *     responses:
 *       200:
 *         description: Lista de funciones futuras de la película.
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const getMovieFunctions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "El id de la película es inválido." });
    }

    const functions = await movieService.getMovieFunctions(id);

    if (!functions) {
      return res.status(404).json({ error: "Película no encontrada." });
    }

    return res.status(200).json(functions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/movies/:id/recommendations
 * Retorna películas similares recomendadas.
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
 *     responses:
 *       200:
 *         description: Lista de películas recomendadas.
 *       404:
 *         description: Película no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const getMovieRecommendations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "El id de la película es inválido." });
    }

    const recommendations = await movieService.getMovieRecommendations(id);

    if (!recommendations) {
      return res.status(404).json({ error: "Película no encontrada." });
    }

    return res.status(200).json(recommendations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
