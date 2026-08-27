// app/src/routes/user.routes.ts

/**
 * Rutas de Usuario
 * ----------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `User`.
 *
 * Endpoints disponibles:
 *  - `POST /users/` : Crear un nuevo usuario.
 *  - `GET /users/`  : Obtener todos los usuarios registrados.
 *
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from 'express';
import { createUser, getUsers, updateLocation } from '../controllers/user.controller.js';

const router = Router();

/**
 * POST /
 * -----
 * Crea un nuevo usuario en la base de datos.
 *
 * Request Body:
 *  - `name`: string (obligatorio)
 *  - `email`: string (obligatorio, único)
 *  - `password`: string (obligatorio)
 *
 * Response:
 *  - 201 Created: Retorna el usuario creado en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la creación.
 *
 *
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: "John Doe"
 *               email: "john.doe@example.com"
 *               password: "password123"
 *
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               error: "El correo ya existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "No se pudo crear el usuario"
 */
router.post('/', createUser);

/**
 * GET /
 * ----
 * Obtiene la lista completa de usuarios registrados en la base de datos.
 *
 * Response:
 *  - 200 OK: Devuelve un array de usuarios en formato JSON.
 *
 *
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *               - id: 2
 *                 name: "Jane Doe"
 *                 email: "john.doe@example.com"
 *       400:
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             example:
 *               error: "Parámetros incorrectos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los usuarios"
 */
router.get('/', getUsers);

/**
 * POST /users/location
 * ------------------------
 * Guarda o valida la ubicación geográfica seleccionada por el usuario (País, Departamento y Ciudad).
 * Si el usuario está autenticado, actualiza su perfil de forma persistente.
 *
 * @swagger
 * /users/location:
 *   post:
 *     summary: Seleccionar y validar ubicación geográfica del usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - countryId
 *               - departmentId
 *               - cityId
 *             properties:
 *               countryId:
 *                 type: integer
 *                 example: 1
 *               departmentId:
 *                 type: integer
 *                 example: 1
 *               cityId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 description: ID del usuario (opcional, útil si no se envía token de autenticación)
 *                 example: 12
 *     responses:
 *       200:
 *         description: Ubicación seleccionada y validada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ubicación seleccionada y validada correctamente."
 *                 location:
 *                   type: object
 *                   properties:
 *                     countryId:
 *                       type: integer
 *                     departmentId:
 *                       type: integer
 *                     cityId:
 *                       type: integer
 *       400:
 *         description: Datos inválidos o faltantes, o la ciudad no está activa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La ciudad seleccionada no está activa."
 *       500:
 *         description: Error interno del servidor
 */
router.post('/location', updateLocation);

export default router;
