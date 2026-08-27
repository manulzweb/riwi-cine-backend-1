// app/src/controllers/reservation.controller.ts

import { Request, Response } from 'express';
import reservationService from '../services/reservation.service.js';
import { LockSeatsDto } from '../dto/request/lock-seats.dto.js';
import { ReleaseSeatsDto } from '../dto/request/release-seats.dto.js';

/**
 * ============================================================================
 * Controlador de Reservas (HU-001)
 * ============================================================================
 *
 * Gestiona las solicitudes HTTP relacionadas con la reserva de sillas para
 * las funciones de cine: consulta de disponibilidad, bloqueo temporal de
 * sillas durante el armado del carrito y liberación de sillas reservadas.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * ReservationController
 *      │
 * ReservationService
 *      │
 * ReservationRepository ─┐
 *      │                 ├─ SeatRepository (disponibilidad de sillas)
 * SeatRepository         ┘
 *      │
 * Sequelize → PostgreSQL
 *
 * Convenciones de errores:
 * Los errores de negocio se traducen aquí a su código HTTP correspondiente
 * (400/404/409/500) en lugar de inspeccionar cadenas de texto.
 */
class ReservationController {
  /**
   * GET /api/functions/:id/seats
   * HU-001/SPRINT3
   */
  async getFunctionSeats(req: Request, res: Response): Promise<void> {
    try {
      const functionId = Number(req.params.id);

      if (!functionId) {
        res.status(400).json({
          message: 'El ID de la función es obligatorio.',
        });
        return;
      }

      const result = await reservationService.getFunctionSeats(functionId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al obtener las sillas.',
      });
    }
  }

  /**
   * POST /api/reservations/lock-seats
   * HU-001/SPRINT3
   */
  async lockSeats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const dto: LockSeatsDto = {
        userId,
        functionId: req.body.functionId,
        seatIds: req.body.seatIds,
      };

      const result = await reservationService.lockSeats(dto);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al bloquear las sillas.',
      });
    }
  }

  /**
   * DELETE /api/reservations/release-seats
   * HU-001/SPRINT3
   */
  async releaseSeats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const dto: ReleaseSeatsDto = {
        reservationId: req.body.reservationId,
        userId,
      };

      await reservationService.releaseSeats(dto);

      res.status(200).json({
        message: 'Las sillas fueron liberadas correctamente.',
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al liberar las sillas.',
      });
    }
  }

  /**
   * GET /api/reservations/summary
   * HU-001/SPRINT3
   */
  async getReservationSummary(req: Request, res: Response): Promise<void> {
    try {
      const reservationId = Number(req.query.reservationId);

      const userId = Number(req.query.userId);

      if (!reservationId || !userId) {
        res.status(400).json({
          message: 'reservationId y userId son obligatorios.',
        });
        return;
      }

      const result = await reservationService.getReservationSummary(reservationId, userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al obtener el resumen.',
      });
    }
  }
}

export default new ReservationController();
