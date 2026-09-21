// app/src/routes/notification.routes.ts

import { Router } from 'express';
import { upcomingNotificationController } from '../containers/upcoming-notification.container.js';
import { validate } from '../middleware/validate.middleware.js';
import { NotificationUpcomingSchema } from '../schemas/notification.schemas.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints para la gestión de notificaciones de próximos estrenos.
 */

/**
 * @swagger
 * /notifications/upcoming:
 *   post:
 *     summary: Registrar solicitud de notificación para un próximo estreno
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *             properties:
 *               movieId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 12
 *               email:
 *                 type: string
 *                 example: "usuario@example.com"
 *     responses:
 *       201:
 *         description: Solicitud registrada exitosamente.
 *       400:
 *         description: Datos inválidos o solicitud duplicada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  '/upcoming',
  validate(NotificationUpcomingSchema, 'body'),
  upcomingNotificationController.register,
);

export default router;
