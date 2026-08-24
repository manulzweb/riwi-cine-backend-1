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

/**
 * Servicio encargado de enviar las notificaciones por correo
 * electrónico de estrenos de películas.
 *
 * Responsabilidades:
 * - Identificar las películas activas cuyo estreno ocurre el día de hoy.
 * - Localizar las solicitudes de notificación pendientes por película.
 * - Enviar el correo de próximo estreno a cada usuario interesado.
 * - Marcar cada notificación como atendida tras su envío.
 * - Registrar los errores producidos sin interrumpir el procesamiento global.
 *
 * El Service consulta los modelos directamente mediante Sequelize
 * para la lectura de películas, notificaciones y usuarios; la
 * actualización del estado de cada notificación se realiza sobre el
 * propio modelo obtenido.
 *
 * @class EmailNotificationService
 *
 * @business
 * Una notificación solo se envía si el usuario asociado se encuentra
 * activo y la solicitud no ha sido atendida previamente
 * (`notifiedAt` en `null`). Cada envío fallido se acumula en el
 * resultado para su trazabilidad sin detener el resto de envíos.
 */
class EmailNotificationService implements IEmailNotificationService {
  /**
   * Procesa las notificaciones de estreno correspondientes al día de hoy.
   *
   * El proceso consiste en:
   *
   * 1. Buscar las películas activas con fecha de estreno igual a hoy.
   * 2. Para cada película, obtener las solicitudes de notificación
   *    pendientes de usuarios activos.
   * 3. Enviar el correo de próximo estreno y marcar la solicitud como
   *    atendida con la fecha actual.
   *
   * Los errores individuales no abortan el proceso: se registran en
   * el resultado retornado.
   *
   * @returns {Promise<ProcessResult>}
   * Resumen del procesamiento:
   * - `moviesProcessed`: cantidad de películas con estreno hoy.
   * - `emailsSent`: cantidad de correos enviados exitosamente.
   * - `errors`: lista de mensajes de error ocurridos durante el envío.
   */
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

/**
 * Instancia única del servicio de notificaciones por correo utilizada
 * por la aplicación.
 *
 * @constant
 * @type {EmailNotificationService}
 */
export default new EmailNotificationService();
