// app/src/controllers/function.controller.ts

import { Request, Response } from 'express';
import functionService from '../services/function.service';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
} from '../errors/domain-errors';

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
