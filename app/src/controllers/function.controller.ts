// app/src/controllers/function.controller.ts

import { Request, Response } from 'express';
import { IFunctionService } from '../services/interfaces/function.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { InvalidFunctionIdError, InvalidMovieIdError } from '../errors/movie.errors.js';

/**
 * ============================================================================
 * Controlador de Funciones y Formatos (HU-009)
 * ============================================================================
 * Gestiona las solicitudes HTTP para consultar el detalle de una función,
 * desglose de precios y listado de funciones por película con filtros.
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → FunctionController → FunctionService → Repositories → PostgreSQL
 * ============================================================================
 */
export class FunctionController {
  constructor(private readonly functionService: IFunctionService) {}

  /**
   * GET /functions/:id
   * Obtiene el detalle completo de una función específica.
   */
  public getFunctionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      throw new InvalidFunctionIdError();
    }

    const data = await this.functionService.getFunctionById(id);
    res.status(200).json(data);
  });

  /**
   * GET /functions/:id/prices
   * Obtiene el desglose de precios y descuentos aplicables a la función.
   */
  public getFunctionPrices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      throw new InvalidFunctionIdError();
    }

    const data = await this.functionService.getFunctionPrices(id);
    res.status(200).json(data);
  });

  /**
   * GET /movies/:id/functions
   * Obtiene el listado de funciones de una película con filtros opcionales.
   */
  public getFunctionsByMovie = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const movieId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(movieId) || movieId <= 0) {
      throw new InvalidMovieIdError();
    }

    const { format, date, cinemaId } = req.query;

    const data = await this.functionService.getFunctionsByMovie(movieId, {
      format: typeof format === 'string' ? format : undefined,
      date: typeof date === 'string' ? date : undefined,
      cinemaId: cinemaId ? Number(cinemaId) : undefined,
    });

    res.status(200).json(data);
  });
}

export default FunctionController;
