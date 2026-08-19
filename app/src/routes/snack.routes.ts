// app/src/routes/snack.routes.ts

/**
 * Rutas de Confitería y Carrito
 * ----------------------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `Snack`.
 * 
 * Endpoints disponibles:
 *  - `GET /`                    : Obtener el catálogo de productos (con filtro opcional).
 *  - `GET /availability`        : Consultar la disponibilidad (stock) de los productos.
 *  - `POST /cart`               : Añadir un producto de confitería al carrito de compras.
 *  - `GET /cart`                : Obtener el carrito del usuario con su valor total.
 *  - `PUT /cart/:cartItemId`    : Actualizar la cantidad de un ítem del carrito.
 *  - `DELETE /cart/:cartItemId` : Eliminar un producto del carrito.
 * 
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from 'express';
import {
  getAllSnacks,
  getSnackAvailability,
  addSnackToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/snack.controller';

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
 *                 finalPrice: 29750.00
 *                 category: "Combos"
 *                 stock: 50
 *                 imageUrl: "https://cine.com"
 *                 discountPercentage: 15.00
 *                 available: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener el catálogo de confitería"
 */
router.get('/', getAllSnacks);

/**
 * GET /availability
 * -----------------
 * Obtiene la disponibilidad (stock) de todos los productos de confitería.
 * 
 * Response:
 *  - 200 OK: Devuelve el stock y disponibilidad de cada producto.
 *  - 500 Internal Server Error: En caso de fallas en el servidor.
 * 
 * @swagger
 * /api/snacks/availability:
 *   get:
 *     summary: Consultar disponibilidad de los productos de confitería
 *     tags: [Confitería]
 *     responses:
 *       200:
 *         description: Disponibilidad de cada producto obtenida con éxito.
 *         content:
 *           application/json:
 *             example:
 *               - id: 6
 *                 name: "Perro Caliente Especial"
 *                 category: "Comida Rápida"
 *                 stock: 0
 *                 available: false
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al consultar la disponibilidad de confitería"
 */
router.get('/availability', getSnackAvailability);

/**
 * POST /cart
 * ----------
 * Agrega una cantidad específica de un producto de confitería al carrito del usuario.
 * 
 * Request Body:
 *  - `userId`: integer (obligatorio) - Identificador del usuario propietario del carrito.
 *  - `snackId`: integer (obligatorio)
 *  - `quantity`: integer (obligatorio, debe ser mayor a cero)
 * 
 * Response:
 *  - 201 Created: Retorna el elemento del carrito agregado de forma exitosa.
 *  - 400 Bad Request: Si el producto está agotado, el stock es insuficiente (RN-049)
 *    o la cantidad no es válida.
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
 *               - userId
 *               - snackId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario propietario del carrito
 *                 example: 1
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
 *                 id: 1
 *                 cartId: 1
 *                 snackId: 1
 *                 quantity: 2
 *                 unitPrice: 29750.00
 *       400:
 *         description: Stock insuficiente, producto agotado o cantidad no válida
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

/**
 * GET /cart
 * ---------
 * Obtiene el carrito del usuario con sus ítems y el valor total,
 * respetando promociones y descuentos aplicados.
 * 
 * Query Parameters:
 *  - `userId`: integer (obligatorio)
 * 
 * Response:
 *  - 200 OK: Retorna los ítems del carrito y el total.
 *  - 400 Bad Request: Si no se envía el userId.
 * 
 * @swagger
 * /api/snacks/cart:
 *   get:
 *     summary: Obtener el carrito de compras del usuario
 *     tags: [Confitería]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario propietario del carrito
 *         example: 1
 *     responses:
 *       200:
 *         description: Carrito obtenido con éxito.
 *         content:
 *           application/json:
 *             example:
 *               cartId: 1
 *               items:
 *                 - cartItemId: 1
 *                   snackId: 1
 *                   name: "Combo Mega"
 *                   imageUrl: "https://cine.com"
 *                   quantity: 2
 *                   priceUnit: 29750.00
 *                   subtotal: 59500.00
 *               total: 59500.00
 *       400:
 *         description: userId no proporcionado
 *         content:
 *           application/json:
 *             example:
 *               error: "El parámetro userId es obligatorio."
 */
router.get('/cart', getCart);

/**
 * PUT /cart/:cartItemId
 * ---------------------
 * Actualiza la cantidad de un ítem del carrito validando el inventario.
 * 
 * Query Parameters:
 *  - `userId`: integer (obligatorio) - ID del usuario propietario del carrito.
 * 
 * Path Parameters:
 *  - `cartItemId`: integer - ID del ítem del carrito.
 * 
 * Request Body:
 *  - `quantity`: integer (obligatorio, debe ser mayor a cero)
 * 
 * Response:
 *  - 200 OK: Retorna el ítem actualizado.
 *  - 400 Bad Request: Cantidad no válida, stock insuficiente o ítem inexistente.
 * 
 * @swagger
 * /api/snacks/cart/{cartItemId}:
 *   put:
 *     summary: Actualizar la cantidad de un producto del carrito
 *     tags: [Confitería]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario propietario del carrito
 *         example: 1
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem del carrito
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Nueva cantidad de unidades
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               message: "Cantidad actualizada con éxito."
 *               data:
 *                 id: 1
 *                 cartId: 1
 *                 snackId: 1
 *                 quantity: 3
 *                 unitPrice: 29750.00
 *       400:
 *         description: Cantidad no válida, stock insuficiente o ítem inexistente
 *         content:
 *           application/json:
 *             example:
 *               error: "El ítem del carrito no existe o no pertenece al usuario."
 */
router.put('/cart/:cartItemId', updateCartItem);

/**
 * DELETE /cart/:cartItemId
 * ------------------------
 * Elimina un producto de confitería del carrito del usuario.
 * 
 * Query Parameters:
 *  - `userId`: integer (obligatorio) - ID del usuario propietario del carrito.
 * 
 * Path Parameters:
 *  - `cartItemId`: integer - ID del ítem del carrito.
 * 
 * Response:
 *  - 200 OK: Producto eliminado del carrito.
 *  - 400 Bad Request: Si el ítem no pertenece al carrito del usuario.
 * 
 * @swagger
 * /api/snacks/cart/{cartItemId}:
 *   delete:
 *     summary: Eliminar un producto del carrito
 *     tags: [Confitería]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario propietario del carrito
 *         example: 1
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem del carrito
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto eliminado del carrito con éxito."
 *       400:
 *         description: El ítem no pertenece al carrito del usuario
 *         content:
 *           application/json:
 *             example:
 *               error: "El ítem del carrito no existe o no pertenece al usuario."
 */
router.delete('/cart/:cartItemId', removeCartItem);

export default router;