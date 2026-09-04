// app/src/controllers/upcoming-notification.controller.ts

import { Request, Response } from 'express';
import { IUpcomingNotificationService } from '../services/interfaces/upcoming-notification.service.interface.js';
import { NotificationUpcomingDto } from '../schemas/notification.schemas.js';
import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Notificaciones de Próximos Estrenos
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con el registro
 * de solicitudes de notificación para próximos estrenos de películas (HU-005).
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al
 * `UpcomingNotificationService`.
 */
export class UpcomingNotificationController {
  constructor(private readonly upcomingNotificationService: IUpcomingNotificationService) {}

  /**
   * Registra una solicitud de notificación para un próximo estreno.
   *
   * @async
   * @param {Request} req Objeto de la petición HTTP.
   * @param {Response} res Objeto de la respuesta HTTP.
   */
  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as NotificationUpcomingDto;
    const result = await this.upcomingNotificationService.register(dto);

    res.status(201).json({
      message: 'Solicitud de notificación registrada exitosamente.',
      data: result,
    });
  });
}
