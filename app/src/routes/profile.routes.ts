// app/src/routes/profile.routes.ts

import { Router } from 'express';
import { profileController } from '../containers/profile.container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Consulta y actualización de perfil de usuario y preferencias (HU-008)
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Consultar el perfil del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: No autenticado
 */
router.get('/', requireAuth, profileController.getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Actualizar información personal y preferencias del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Carlos"
 *               lastName:
 *                 type: string
 *                 example: "Charris"
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-15"
 *               gender:
 *                 type: string
 *                 example: "Masculino"
 *               cityId:
 *                 type: integer
 *                 example: 1
 *               favoriteCinemaId:
 *                 type: integer
 *                 example: 2
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   emailEnabled:
 *                     type: boolean
 *                   smsEnabled:
 *                     type: boolean
 *                   pushEnabled:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.put('/', requireAuth, profileController.updateProfile);

export default router;
