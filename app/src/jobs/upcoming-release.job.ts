// app/src/jobs/upcoming-release.job.ts

import cron, { ScheduledTask } from 'node-cron';
import emailNotificationService from '../services/email-notification.service.js';

const CRON_SCHEDULE = '0 0 * * *';

export const startUpcomingReleaseJob = (): ScheduledTask => {
  return cron.schedule(CRON_SCHEDULE, async () => {
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
