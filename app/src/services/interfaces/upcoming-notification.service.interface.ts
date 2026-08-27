// app/src/services/interfaces/upcoming-notification.service.interface.ts

import { NotificationUpcomingDto } from '../../schemas/notification.schemas.js';

export interface UpcomingNotificationResult {
  id: number;
  userId: number;
  movieId: number;
}

export interface IUpcomingNotificationService {
  /** Registra la solicitud de aviso de estreno (RN-017, RN-019). */
  register(dto: NotificationUpcomingDto): Promise<UpcomingNotificationResult>;
}
