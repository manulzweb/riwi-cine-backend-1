// app/src/routes/function.routes.ts

import { Router } from 'express';
import { functionController } from '../containers/function.container.js';
import { reservationController } from '../containers/reservation.container.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Functions
 *   description: Consulta de funciones, horarios y formatos de proyección (HU-009)
 */

/**
 * @swagger
 * /functions/movie/{id}:
 *   get:
 *     summary: Obtener funciones de una película con filtros (formato, fecha, cine)
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *         description: Formato de proyección (2D, 3D, IMAX, VIP)
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *         description: Fecha de la función (YYYY-MM-DD)
 *       - in: query
 *         name: cinemaId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del cine o complejo
 *     responses:
 *       200:
 *         description: Funciones obtenidas exitosamente
 *       404:
 *         description: Película no encontrada
 */
router.get('/movie/:id', functionController.getFunctionsByMovie);

/**
 * @swagger
 * /functions/{id}/prices:
 *   get:
 *     summary: Obtener el desglose de precios y promociones de una función
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función
 *     responses:
 *       200:
 *         description: Precios calculados exitosamente
 *       400:
 *         description: Función inactiva o ya iniciada
 *       404:
 *         description: Función no encontrada
 */
router.get('/:id/prices', functionController.getFunctionPrices);

/**
 * @swagger
 * /functions/{id}/seats:
 *   get:
 *     summary: Obtener el mapa de sillas y disponibilidad en tiempo real de una función (HU-010)
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función
 *     responses:
 *       200:
 *         description: Mapa interactivo de sillas obtenido exitosamente
 *       400:
 *         description: Función inactiva o ya iniciada
 *       404:
 *         description: Función no encontrada
 */
router.get('/:id/seats', reservationController.getFunctionSeats);

/**
 * @swagger
 * /functions/{id}:
 *   get:
 *     summary: Obtener el detalle de una función
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función
 *     responses:
 *       200:
 *         description: Detalle de la función obtenido exitosamente
 *       400:
 *         description: Función inactiva o ya iniciada
 *       404:
 *         description: Función no encontrada
 */
router.get('/:id', functionController.getFunctionById);

export default router;
