// app/src/routes/reservation.routes.ts

import { Router } from 'express';
import { reservationController } from '../containers/reservation.container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestión de selección interactiva y bloqueo temporal de sillas (HU-010)
 */

/**
 * @swagger
 * /reservations/lock-seats:
 *   post:
 *     summary: Bloquear temporalmente las sillas seleccionadas (RN-039)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionId
 *               - seatIds
 *             properties:
 *               functionId:
 *                 type: integer
 *                 example: 1
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Sillas bloqueadas exitosamente por 10 minutos
 *       400:
 *         description: Datos inválidos o límite de sillas superado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Función o silla no encontrada
 *       409:
 *         description: Silla ocupada o reservada
 */
router.post('/lock-seats', requireAuth, reservationController.lockSeats);

/**
 * @swagger
 * /reservations/release-seats:
 *   delete:
 *     summary: Liberar voluntariamente las sillas de una reserva activa (RN-040)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Reserva liberada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso no autorizado a la reserva
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/release-seats', requireAuth, reservationController.releaseSeats);

/**
 * @swagger
 * /reservations/summary:
 *   get:
 *     summary: Obtener el resumen de una reserva activa
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Resumen de la reserva obtenido exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Reserva no encontrada o expirada
 */
router.get('/summary', requireAuth, reservationController.getReservationSummary);

/**
 * @swagger
 * /reservations/{id}/summary:
 *   get:
 *     summary: Obtener el resumen de una reserva por ID en ruta
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Resumen de la reserva obtenido exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Reserva no encontrada o expirada
 */
router.get('/:id/summary', requireAuth, reservationController.getReservationSummary);

export default router;
