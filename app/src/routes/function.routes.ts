import { Router } from 'express';
import { getFunctionById, getFunctionPrices } from '../controllers/function.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Functions
 *   description: Endpoints para la selección de función y formato de proyección (HU-009).
 */

/**
 * @swagger
 * /api/functions/{id}:
 *   get:
 *     summary: Obtener el detalle de una función
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función.
 *     responses:
 *       200:
 *         description: Detalle de la función obtenido correctamente.
 *       400:
 *         description: Id inválido, o la función ya inició / no está activa.
 *       404:
 *         description: Función no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', getFunctionById);

/**
 * @swagger
 * /api/functions/{id}/prices:
 *   get:
 *     summary: Obtener el precio calculado de una función
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función.
 *     responses:
 *       200:
 *         description: Precio calculado correctamente (recalculado en cada solicitud).
 *       400:
 *         description: Id inválido, o la función ya inició / no está activa.
 *       404:
 *         description: Función no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/prices', getFunctionPrices);

export default router;
