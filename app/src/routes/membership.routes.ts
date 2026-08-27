// app/src/routes/membership.routes.ts

import { Router } from 'express';
import { createMembership } from '../controllers/membership.controller.js';

const router = Router();

/**
 * POST /membership/create
 * ----------------------------
 * Crea manualmente una membresía digital para un usuario específico.
 * Nota: El proceso de registro de usuario (POST /auth/register) ya crea
 * automáticamente la membresía digital. Este endpoint sirve para creación manual
 * o casos de contingencia.
 *
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Membresía digital creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "MC-738291-102938"
 *                     pointsBalance:
 *                       type: integer
 *                       example: 0
 *                     level:
 *                       type: string
 *                       example: "BÁSICA"
 *                     status:
 *                       type: string
 *                       example: "Activa"
 *       400:
 *         description: El ID de usuario es obligatorio o el usuario ya cuenta con una membresía activa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El usuario ya cuenta con una membresía digital activa"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor o configuración faltante (nivel o estado por defecto)
 */
router.post('/create', createMembership);

export default router;
