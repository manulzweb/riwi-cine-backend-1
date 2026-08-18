// app/src/controllers/upcoming-notification.controller.ts

import { Request, Response } from 'express';
import upcomingNotificationService from '../services/upcoming-notification.service';
import { NotificationUpcomingDto } from '../schemas/notification.schemas';

export const registerUpcomingNotification = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const dto = req.body as NotificationUpcomingDto;
    const result = await upcomingNotificationService.register(dto);

    return res.status(201).json({
      message: 'Solicitud de notificación registrada exitosamente.',
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(400).json({ error: message });
  }
};
