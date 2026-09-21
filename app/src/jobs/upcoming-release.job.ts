// app/src/jobs/upcoming-release.job.ts

import cron, { ScheduledTask } from 'node-cron';
import emailNotificationService from '../services/email-notification.service.js';
import { CRON_SCHEDULES } from '../constant/index.js';

export const startUpcomingReleaseJob = (): ScheduledTask => {
  return cron.schedule(CRON_SCHEDULES.DAILY_MIDNIGHT, async () => {
    try {
      const result = await emailNotificationService.processTodayReleases();
      console.log(
        `[UpcomingReleaseJob] Películas: ${result.moviesProcessed} | Emails: ${result.emailsSent} | Errores: ${result.errors.length}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[UpcomingReleaseJob] Error: ${message}`);
    }
  });
};
