// app/src/routes/snack.routes.ts

import { Router } from 'express';
import { snackController } from '../containers/snack.container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

/**
 * ============================================================================
 * Rutas de Confitería y Carrito de Snacks (HU-012)
 * ============================================================================
 *
 * Endpoints disponibles:
 *  - GET    /api/v1/snacks                  : Catálogo completo de confitería con precios efectivos
 *  - GET    /api/v1/snacks/categories       : Listado de categorías disponibles
 *  - GET    /api/v1/snacks/availability     : Disponibilidad de inventario en tiempo real (RN-049)
 *  - GET    /api/v1/snacks/:id              : Detalle de un producto con promociones aplicadas
 *  - POST   /api/v1/snacks/cart             : Agregar producto de confitería al carrito activo
 *  - GET    /api/v1/snacks/cart             : Consultar productos de confitería en el carrito
 *  - PUT    /api/v1/snacks/cart/:cartItemId : Actualizar cantidad de un ítem en el carrito
 *  - DELETE /api/v1/snacks/cart/:cartItemId : Eliminar un ítem de confitería del carrito
 *
 * Arquitectura:
 * Router → Container (snackController) → SnackService → Repositories → PostgreSQL
 * ============================================================================
 */

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Confitería
 *   description: Catálogo de confitería, promociones e ítems del carrito (HU-012)
 */

/**
 * @swagger
 * /snacks:
 *   get:
 *     summary: Obtener catálogo completo de productos de confitería
 *     tags: [Confitería]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (ej. Combos, Crispetas, Bebidas, Comidas Rápidas)
 *         example: Combos
 *     responses:
 *       200:
 *         description: Lista de productos con precios efectivos y disponibilidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Combo Mega Familiar
 *                   description:
 *                     type: string
 *                     example: 1 Crispeta gigante, 4 Gaseosas medianas
 *                   price:
 *                     type: number
 *                     example: 45000
 *                   category:
 *                     type: string
 *                     example: Combos
 *                   stock:
 *                     type: integer
 *                     example: 40
 *                   imageUrl:
 *                     type: string
 *                     example: https://images.unsplash.com/photo-1585647347483-22b66260dfff
 *                   discountPercentage:
 *                     type: number
 *                     example: 10
 *                   finalPrice:
 *                     type: number
 *                     example: 40500
 *                   available:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', snackController.getAllSnacks);

/**
 * @swagger
 * /snacks/categories:
 *   get:
 *     summary: Obtener la lista de categorías disponibles de confitería
 *     tags: [Confitería]
 *     responses:
 *       200:
 *         description: Lista de categorías existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             example: ["Combos", "Crispetas", "Bebidas", "Comidas Rápidas"]
 */
router.get('/categories', snackController.getCategories);

/**
 * @swagger
 * /snacks/availability:
 *   get:
 *     summary: Consultar disponibilidad e inventario en tiempo real (RN-049)
 *     tags: [Confitería]
 *     responses:
 *       200:
 *         description: Lista de disponibilidad de todos los productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Crispeta de Caramelo Grande
 *                   category:
 *                     type: string
 *                     example: Crispetas
 *                   stock:
 *                     type: integer
 *                     example: 120
 *                   available:
 *                     type: boolean
 *                     example: true
 */
router.get('/availability', snackController.getSnackAvailability);

/**
 * @swagger
 * /snacks/cart:
 *   post:
 *     summary: Añadir un producto de confitería al carrito activo del usuario
 *     tags: [Confitería]
 *     security:
 *       - bearerAuth: []
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
 *               userId:
 *                 type: integer
 *                 description: ID del usuario (opcional si se envía Bearer token)
 *                 example: 1
 *               snackId:
 *                 type: integer
 *                 description: ID del producto de confitería
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 description: Cantidad de unidades deseadas (> 0)
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
 *                 unitPrice: 28000
 *       400:
 *         description: Stock insuficiente, producto agotado (RN-049) o datos inválidos
 *       404:
 *         description: Producto o usuario no encontrado
 */
router.post('/cart', requireAuth, snackController.addSnackToCart);

/**
 * @swagger
 * /snacks/cart:
 *   get:
 *     summary: Obtener los productos de confitería en el carrito del usuario
 *     tags: [Confitería]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del usuario (opcional si se envía Bearer token)
 *         example: 1
 *     responses:
 *       200:
 *         description: Carrito obtenido con ítems y total calculado
 *         content:
 *           application/json:
 *             example:
 *               cartId: 1
 *               items:
 *                 - cartItemId: 1
 *                   snackId: 1
 *                   name: "Combo Mega Familiar"
 *                   imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff"
 *                   quantity: 2
 *                   priceUnit: 40500
 *                   subtotal: 81000
 *               total: 81000
 *       400:
 *         description: Parámetro userId no provisto y token ausente
 */
router.get('/cart', requireAuth, snackController.getCart);

/**
 * @swagger
 * /snacks/cart/{cartItemId}:
 *   put:
 *     summary: Actualizar la cantidad de un ítem de confitería del carrito
 *     tags: [Confitería]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem de carrito
 *         example: 1
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del usuario (opcional si se envía Bearer token)
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
 *                 description: Nueva cantidad deseada (> 0)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente
 *       400:
 *         description: Cantidad inválida o stock insuficiente (RN-049)
 *       404:
 *         description: Ítem o carrito no encontrado
 */
router.put('/cart/:cartItemId', requireAuth, snackController.updateCartItem);

/**
 * @swagger
 * /snacks/cart/{cartItemId}:
 *   delete:
 *     summary: Eliminar un producto de confitería del carrito
 *     tags: [Confitería]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem de carrito
 *         example: 1
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del usuario (opcional si se envía Bearer token)
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito exitosamente
 *       404:
 *         description: Ítem o carrito no encontrado
 */
router.delete('/cart/:cartItemId', requireAuth, snackController.removeCartItem);

/**
 * @swagger
 * /snacks/{id}:
 *   get:
 *     summary: Obtener el detalle de un producto de confitería
 *     tags: [Confitería]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalle del producto con precio efectivo y promociones
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', snackController.getSnackById);

export default router;
