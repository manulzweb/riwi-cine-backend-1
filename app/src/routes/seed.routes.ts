// app/src/routes/seed.routes.ts

import { Request, Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { seedController } from '../containers/seed.container.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .json'));
    }
  },
});

/**
 * @swagger
 * /seed/upload:
 *   post:
 *     summary: Poblar base de datos desde un archivo JSON
 *     tags: [Seed]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Base de datos poblada exitosamente
 *       400:
 *         description: Archivo inválido o formato incorrecto
 */
router.post('/upload', upload.single('file'), seedController.seedFromFile);

/**
 * @swagger
 * /seed/json:
 *   post:
 *     summary: Poblar base de datos desde un payload JSON directo
 *     tags: [Seed]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Base de datos poblada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/json', seedController.seedFromJsonBody);

export default router;
