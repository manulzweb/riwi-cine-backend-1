// app/src/controllers/profile.controller.ts

import { Request, Response } from 'express';
import { IProfileService } from '../services/interfaces/profile.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { UpdateProfileRequestDto } from '../dto/request/update-profile.dto.js';

/**
 * ============================================================================
 * Controlador de Perfil de Usuario (HU-008)
 * ============================================================================
 * Gestiona las solicitudes HTTP para consultar y actualizar el perfil del usuario,
 * incluyendo su información personal, membresía digital con código QR y preferencias.
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → ProfileController → ProfileService → Repositories → PostgreSQL
 * ============================================================================
 */
export class ProfileController {
  constructor(private readonly profileService: IProfileService) {}

  /**
   * GET /profile
   * Obtiene el perfil completo del usuario autenticado.
   */
  public getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const data = await this.profileService.getProfile(userId);
    res.status(200).json(data);
  });

  /**
   * PUT /profile
   * Actualiza los datos de contacto y preferencias del perfil.
   */
  public updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const dto: UpdateProfileRequestDto = req.body ?? {};
    const data = await this.profileService.updateProfile(userId, dto);

    res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      data,
    });
  });
}

export default ProfileController;
