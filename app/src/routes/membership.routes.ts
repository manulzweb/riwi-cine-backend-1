// app/src/routes/membership.routes.ts

import { Router } from 'express';
import { membershipController } from '../containers/membership.container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Gestión de membresía digital y beneficios (HU-008)
 */

/**
 * @swagger
 * /membership:
 *   get:
 *     summary: Consultar membresía digital del usuario autenticado
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalle de membresía con código QR
 *       401:
 *         description: No autenticado
 */
router.get('/', requireAuth, membershipController.getMembership);

/**
 * @swagger
 * /membership/benefits:
 *   get:
 *     summary: Consultar beneficios y descuentos vigentes por nivel de membresía (RN-032)
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de beneficios y porcentaje de descuento calculado
 *       401:
 *         description: No autenticado
 */
router.get('/benefits', requireAuth, membershipController.getBenefits);

/**
 * @swagger
 * /membership/create:
 *   post:
 *     summary: Crear membresía digital manualmente para un usuario
 *     tags: [Membership]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Membresía digital creada exitosamente
 *       400:
 *         description: El ID de usuario es obligatorio o el usuario ya cuenta con membresía activa
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/create', membershipController.createMembership);

export default router;
