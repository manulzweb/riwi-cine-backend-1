// app/src/routes/department.routes.ts

import { Router } from 'express';
import { getDepartments } from '../controllers/department.controller';

const router = Router();

/**
 * @swagger
 * /api/departments/{countryId}:
 *   get:
 *     summary: Obtener departamentos por país
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país
 *     responses:
 *       200:
 *         description: Lista de departamentos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Antioquia"
 *                 countryId: 1
 *               - id: 2
 *                 name: "Cundinamarca"
 *                 countryId: 1
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los departamentos"
 */
router.get('/:countryId', getDepartments);

export default router;
