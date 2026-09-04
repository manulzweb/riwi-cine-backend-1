// app/src/controllers/reservation.controller.ts

import { Request, Response } from 'express';
import { IReservationService } from '../services/interfaces/reservation.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { InvalidFunctionIdError } from '../errors/movie.errors.js';
import { InvalidReservationIdError } from '../errors/reservation.errors.js';

/**
 * ============================================================================
 * Controlador de Selección y Reserva de Sillas (HU-010)
 * ============================================================================
 *
 * Gestiona las peticiones HTTP relacionadas con la consulta interactiva del
 * mapa de la sala, bloqueo temporal de sillas y liberación de reservas.
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → ReservationController → ReservationService → Repositories → PostgreSQL
 * ============================================================================
 */
export class ReservationController {
  constructor(private readonly reservationService: IReservationService) {}

  /**
   * GET /functions/:id/seats
   * Obtiene el mapa interactivo de sillas y disponibilidad en tiempo real.
   */
  public getFunctionSeats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const functionId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(functionId) || functionId <= 0) {
      throw new InvalidFunctionIdError();
    }

    const data = await this.reservationService.getFunctionSeats(functionId);
    res.status(200).json(data);
  });

  /**
   * POST /reservations/lock-seats
   * Bloquea temporalmente las sillas seleccionadas durante 10 minutos (RN-039).
   */
  public lockSeats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId ?? req.body.userId;
    const { functionId, seatIds } = req.body;

    const data = await this.reservationService.lockSeats({
      userId: Number(userId),
      functionId: Number(functionId),
      seatIds: Array.isArray(seatIds) ? seatIds.map(Number) : [],
    });

    res.status(201).json(data);
  });

  /**
   * DELETE /reservations/release-seats
   * Libera voluntariamente las sillas de una reserva activa.
   */
  public releaseSeats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId ?? req.body.userId ?? req.query.userId;
    const reservationId = req.body.reservationId ?? req.query.reservationId;

    if (!reservationId || Number.isNaN(Number(reservationId))) {
      throw new InvalidReservationIdError();
    }

    await this.reservationService.releaseSeats(Number(reservationId), Number(userId));

    res.status(200).json({
      success: true,
      message: 'Las sillas fueron liberadas exitosamente.',
    });
  });

  /**
   * GET /reservations/summary o GET /reservations/:id/summary
   * Obtiene el resumen de una reserva activa para transferir al carrito.
   */
  public getReservationSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId ?? req.query.userId;
    const reservationId = req.params.id ?? req.query.reservationId;

    if (!reservationId || Number.isNaN(Number(reservationId))) {
      throw new InvalidReservationIdError();
    }

    const data = await this.reservationService.getReservationSummary(
      Number(reservationId),
      Number(userId),
    );

    res.status(200).json(data);
  });
}

export default ReservationController;
