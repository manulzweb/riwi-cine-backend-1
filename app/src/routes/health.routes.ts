// app/src/routes/health.routes.ts

import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';

const router = Router();
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificar estado de la API y servicios
 *     description: Verifica el estado de la API y la conexión a la base de datos
 *     responses:
 *       200:
 *         description: API en funcionamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 uptime:
 *                   type: number
 *                   example: 1234.56
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: UP
 *       500:
 *         description: API o servicios fuera de línea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: DOWN
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "DOWN: connection refused"
 */ router.get('/', checkHealth);

export default router;
