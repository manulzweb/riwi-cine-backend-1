// app/src/controllers/function.controller.ts

import { Request, Response } from 'express';
import functionService from '../services/function.service';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
  MovieNotFoundError,
} from '../errors/domain-errors';
import { FunctionListQueryDto } from '../schemas/function.schemas';

/**
 * ============================================================================
 * Controlador de Funciones (HU-009)
 * ============================================================================
 * Igual que movie.controller.ts: solo recibe la request, llama al service
 * y traduce el resultado (o el error) a una respuesta HTTP. Sin reglas de
 * negocio ni acceso a Sequelize aquí.
 * ============================================================================
 */

/**
 * GET /functions/:id
 * Detalle de una función específica.
 */
export const getFunctionById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la función es inválido.' });
    }

    const fn = await functionService.getFunctionById(id);
    return res.status(200).json(fn);
  } catch (error: unknown) {
    if (error instanceof FunctionNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof FunctionInactiveError || error instanceof FunctionAlreadyStartedError) {
      return res.status(400).json({ error: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

/**
 * GET /functions/:id/prices
 * Precio calculado de una función (RN-037, RN-038).
 */
export const getFunctionPrices = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la función es inválido.' });
    }

    const prices = await functionService.getFunctionPrices(id);
    return res.status(200).json(prices);
  } catch (error: unknown) {
    if (error instanceof FunctionNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof FunctionInactiveError || error instanceof FunctionAlreadyStartedError) {
      return res.status(400).json({ error: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

/**
 * GET /movies/:movieId/functions
 * Lista las funciones disponibles de una película, con filtros
 * opcionales por formato, fecha y complejo de cine (HU-009).
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en params:
 * @example
 * GET /api/v1/movies/42/functions?format=3D&date=2026-08-30&cinemaId=1
 * req.params.movieId = "42"
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
 *   Listado de funciones disponibles (puede ser vacío).
 *
 * - **404 Not Found**
 *   La película no existe.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 */
export const getFunctionsByMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movieId = Number(req.params.movieId);

    if (Number.isNaN(movieId)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    // La query ya llega validada y con tipos coercidos por
    // `validate(FunctionListQuerySchema, 'query')` en la ruta.
    const { format, date, cinemaId } = req.query as unknown as FunctionListQueryDto;

    const functions = await functionService.getFunctionsByMovie(movieId, {
      format,
      date,
      cinemaId,
    });
    return res.status(200).json(functions);
  } catch (error: unknown) {
    if (error instanceof MovieNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
