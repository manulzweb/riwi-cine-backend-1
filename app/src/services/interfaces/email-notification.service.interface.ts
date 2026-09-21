// app/src/services/interfaces/email-notification.service.interface.ts

export interface ProcessResult {
  moviesProcessed: number;
  emailsSent: number;
  errors: string[];
}

export interface IEmailNotificationService {
  /** Procesa películas con releaseDate == hoy y envía notificaciones pendientes (RN-020). */
  processTodayReleases(): Promise<ProcessResult>;
}
