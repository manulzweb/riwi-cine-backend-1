// app/src/routes/country.routes.ts

import { Router } from 'express';
import { getCountries } from '../controllers/country.controller.js';

const router = Router();

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Obtener todos los países
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Lista de países obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Colombia"
 *               - id: 2
 *                 name: "México"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los países"
 */
router.get('/', getCountries);

export default router;
