// app/src/controllers/membership.controller.ts

import { Request, Response } from 'express';
import { IMembershipService } from '../services/interfaces/membership.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Membresías y Beneficios (HU-008)
 * ============================================================================
 * Gestiona las solicitudes HTTP relacionadas con la consulta de membresía,
 * cálculo de beneficios y descuentos por nivel, y creación de membresía.
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → MembershipController → MembershipService → Repositories → PostgreSQL
 * ============================================================================
 */
export class MembershipController {
  constructor(private readonly membershipService: IMembershipService) {}

  /**
   * POST /membership/create
   * Crea manualmente una membresía para un usuario.
   */
  public createMembership = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body ?? {};

    if (!userId || Number.isNaN(Number(userId))) {
      res
        .status(400)
        .json({ error: 'El ID de usuario es obligatorio y debe ser un número válido.' });
      return;
    }

    const data = await this.membershipService.createMembership(Number(userId));
    res.status(201).json({
      message: 'Membresía digital creada exitosamente',
      data,
    });
  });

  /**
   * GET /membership
   * Obtiene los datos completos de la membresía del usuario autenticado con su código QR.
   */
  public getMembership = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const data = await this.membershipService.getMembership(userId);
    res.status(200).json(data);
  });

  /**
   * GET /membership/benefits
   * Obtiene los beneficios y descuentos vigentes según el nivel de membresía (RN-032).
   */
  public getBenefits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const data = await this.membershipService.getBenefits(userId);
    res.status(200).json(data);
  });
}

export default MembershipController;
