// app/src/routes/city.routes.ts

import { Router } from 'express';
import { cityController } from '../containers/city.container.js';

const router = Router();

/**
 * @swagger
 * /cities/{departmentId}:
 *   get:
 *     summary: Obtener ciudades activas por departamento (solo con cine activo)
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Lista de ciudades obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Medellín"
 *                 departmentId: 1
 *                 isActive: true
 *               - id: 2
 *                 name: "Bogotá"
 *                 departmentId: 2
 *                 isActive: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las ciudades"
 */
router.get('/:departmentId', cityController.getCities);

export default router;
