// app/src/routes/reservation.routes.ts

import { Router } from 'express';
import reservationController from '../controllers/reservation.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestión de selección y bloqueo temporal de sillas
 */

/**
 * @swagger
 * /functions/{id}/seats:
 *   get:
 *     summary: Obtener mapa de sillas de una función
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función
 *     responses:
 *       200:
 *         description: Mapa de sillas de la función
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: La función no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/functions/:id/seats', requireAuth, reservationController.getFunctionSeats);

/**
 * @swagger
 * /reservations/lock-seats:
 *   post:
 *     summary: Bloquear temporalmente las sillas seleccionadas
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
 *                 example: 5
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Sillas bloqueadas correctamente durante 10 minutos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Datos inválidos o sillas ocupadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Función no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reservations/lock-seats', requireAuth, reservationController.lockSeats);

/**
 * @swagger
 * /reservations/release-seats:
 *   delete:
 *     summary: Liberar las sillas de una reserva
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
 *               - reservationId
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Reserva liberada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Las sillas fueron liberadas correctamente.
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/reservations/release-seats', requireAuth, reservationController.releaseSeats);

/**
 * @swagger
 * /reservations/summary:
 *   get:
 *     summary: Obtener el resumen de una reserva
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
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Resumen de la reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/reservations/summary', requireAuth, reservationController.getReservationSummary);

export default router;
