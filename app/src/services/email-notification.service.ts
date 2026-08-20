// app/src/services/email-notification.service.ts

import Movie from '../models/movie.model';
import UpcomingMovieNotification from '../models/upcoming-movie-notification.model';
import User from '../models/user.model';
import { sendUpcomingReleaseEmail } from '../config/mailer';
import { todayDateOnly } from '../utils/date.util';
import {
  IEmailNotificationService,
  ProcessResult,
} from './interfaces/email-notification.service.interface';

class EmailNotificationService implements IEmailNotificationService {
  async processTodayReleases(): Promise<ProcessResult> {
    const result: ProcessResult = { moviesProcessed: 0, emailsSent: 0, errors: [] };
    const today = todayDateOnly();

    const movies = await Movie.findAll({
      where: { isActive: true, releaseDate: today },
    });

    result.moviesProcessed = movies.length;

    for (const movie of movies) {
      const pendingNotifications = await UpcomingMovieNotification.findAll({
        where: { movieId: movie.id, notifiedAt: null },
        include: [{ model: User, as: 'user', where: { isActive: true } }],
      });

      for (const notification of pendingNotifications) {
        try {
          const user = await User.findByPk(notification.userId);
          if (!user) continue;

          await sendUpcomingReleaseEmail(user.email, movie.title);
          await notification.update({ notifiedAt: new Date() });
          result.emailsSent++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          result.errors.push(`Notificación ${notification.id}: ${message}`);
        }
      }
    }

    return result;
  }
}

export default new EmailNotificationService();
