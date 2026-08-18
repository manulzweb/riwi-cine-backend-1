// app/src/routes/snack.routes.ts

/**
 * Rutas de Confitería y Carrito
 * ----------------------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `Snack`.
 * 
 * Endpoints disponibles:
 *  - `GET /`         : Obtener el catálogo de productos (con filtro opcional).
 *  - `POST /cart`    : Añadir un producto de confitería al carrito de compras.
 * 
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from 'express';
import { getAllSnacks, addSnackToCart } from '../controllers/snack.controller';

const router = Router();

/**
 * GET /
 * ----
 * Obtiene el catálogo completo de productos de confitería disponibles.
 * 
 * Query Parameters:
 *  - `category`: string (opcional, ej. "Combos")
 * 
 * Response:
 *  - 200 OK: Devuelve un array de productos de confitería en formato JSON.
 *  - 500 Internal Server Error: En caso de fallas en el servidor.
 * 
 * @swagger
 * /api/snacks:
 *   get:
 *     summary: Obtener el catálogo completo de confitería
 *     tags: [Confitería]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Nombre de la categoría para filtrar los productos
 *         example: "Combos"
 *     responses:
 *       200:
 *         description: Lista de productos de confitería obtenida con éxito.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Combo Mega"
 *                 description: "Crispeta gigante, dos gaseosas grandes y un chocolate"
 *                 price: 35000.00
 *                 category: "Combos"
 *                 stock: 50
 *                 imageUrl: "https://cine.com"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener el catálogo de confitería"
 */
router.get('/', getAllSnacks);

/**
 * POST /cart
 * ----------
 * Agrega una cantidad específica de un producto de confitería al carrito del usuario.
 * 
 * Request Body:
 *  - `snackId`: integer (obligatorio)
 *  - `quantity`: integer (obligatorio, debe ser mayor a cero)
 * 
 * Response:
 *  - 201 Created: Retorna el elemento del carrito agregado de forma exitosa.
 *  - 400 Bad Request: Si el producto está agotado o el stock es insuficiente (RN-049).
 *  - 500 Internal Server Error: En caso de errores en la base de datos.
 * 
 * @swagger
 * /api/snacks/cart:
 *   post:
 *     summary: Añadir un producto de confitería al carrito de compras
 *     tags: [Confitería]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - snackId
 *               - quantity
 *             properties:
 *               snackId:
 *                 type: integer
 *                 description: ID numérico del producto de confitería
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 description: Cantidad de unidades deseadas
 *                 example: 2
 *     responses:
 *       201:
 *         description: Producto añadido al carrito exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto agregado al carrito con éxito."
 *               data:
 *                 snackId: 1
 *                 name: "Combo Mega"
 *                 quantityRequested: 2
 *                 priceUnit: 35000.00
 *       400:
 *         description: Stock insuficiente o producto agotado (RN-049)
 *         content:
 *           application/json:
 *             example:
 *               error: "Producto agotado o stock insuficiente. Unidades disponibles en tienda: 0"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "No se pudo añadir el producto al carrito"
 */
router.post('/cart', addSnackToCart);

export default router;
