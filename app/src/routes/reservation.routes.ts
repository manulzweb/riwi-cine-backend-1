import { Router } from 'express';
import reservationController from '../controllers/reservation.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestión de selección y bloqueo temporal de sillas
 */

/**
 * @swagger
 * /api/functions/{id}/seats:
 *   get:
 *     summary: Obtener mapa de sillas de una función
 *     tags: [Reservations]
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
 *       404:
 *         description: La función no existe
 */
router.get('/functions/:id/seats', reservationController.getFunctionSeats);

/**
 * @swagger
 * /api/reservations/lock-seats:
 *   post:
 *     summary: Bloquear temporalmente las sillas seleccionadas
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - functionId
 *               - seatIds
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
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
 *       400:
 *         description: Datos inválidos o sillas ocupadas
 */
router.post('/reservations/lock-seats', reservationController.lockSeats);

/**
 * @swagger
 * /api/reservations/release-seats:
 *   delete:
 *     summary: Liberar las sillas de una reserva
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - userId
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Reserva liberada correctamente
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/reservations/release-seats', reservationController.releaseSeats);

/**
 * @swagger
 * /api/reservations/summary:
 *   get:
 *     summary: Obtener resumen de una reserva
 *     tags: [Reservations]
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
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/reservations/summary', reservationController.getReservationSummary);

export default router;
