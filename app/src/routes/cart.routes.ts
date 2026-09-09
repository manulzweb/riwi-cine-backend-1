// app/src/routes/cart.routes.ts

/**
 * Rutas de Carrito de Compras (HU-011)
 * ------------------------------------
 * Endpoints disponibles (prefijo /api/v1):
 *  - `POST /cart`                    : Crea el carrito a partir de las sillas seleccionadas.
 *  - `GET /cart`                     : Detalle completo del carrito activo.
 *  - `PUT /cart`                     : Modifica confitería y quita entradas.
 *  - `DELETE /cart`                  : Cancela el carrito y libera sillas.
 *  - `POST /cart/apply-membership`   : Aplica el descuento de membresía (RN-047).
 *  - `POST /cart/apply-giftcard`     : Aplica bonos del wallet del usuario.
 *
 * Todas las rutas requieren autenticación con Bearer token.
 */

import { Router } from 'express';
import { cartController } from '../containers/cart.container.js';
import { snackController } from '../containers/snack.container.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Carrito de compras de entradas y confitería (HU-011)
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Crea el carrito a partir de las sillas seleccionadas
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionId
 *               - seatIds
 *             properties:
 *               functionId:
 *                 type: integer
 *                 example: 5
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [12, 13]
 *     responses:
 *       201:
 *         description: Carrito creado con su detalle completo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartDetailResponseDto'
 *       400:
 *         description: Datos inválidos, sillas ocupadas o función agotada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', requireAuth, cartController.create);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Obtiene el detalle completo del carrito activo
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalle del carrito activo con entradas, confitería y resumen económico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartDetailResponseDto'
 *       400:
 *         description: No existe un carrito activo o se encuentra expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', requireAuth, cartController.getDetail);

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Modifica cantidades de confitería y/o quita entradas del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               snacks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - snackId
 *                     - quantity
 *                   properties:
 *                     snackId:
 *                       type: integer
 *                       example: 3
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               removeTicketIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [7]
 *             example:
 *               snacks:
 *                 - snackId: 12
 *                   quantity: 1
 *               removeTicketIds: [8]
 *     responses:
 *       200:
 *         description: Carrito actualizado con su detalle y resumen recalculados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartDetailResponseDto'
 *       400:
 *         description: Cantidades negativas, stock insuficiente o entrada inexistente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/', requireAuth, cartController.update);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Cancela el carrito activo y libera las sillas reservadas
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito cancelado y sillas liberadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: No existe un carrito activo para este usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', requireAuth, cartController.remove);

/**
 * @swagger
 * /cart/apply-membership:
 *   post:
 *     summary: Aplica el descuento automático por membresía (RN-047)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen del carrito con el descuento de membresía aplicado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 discountPercentage:
 *                   type: number
 *                   example: 10
 *                 discountAmount:
 *                   type: number
 *                   example: 2400
 *       400:
 *         description: Sin carrito activo o membresía sin descuento aplicable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/apply-membership', requireAuth, cartController.applyMembership);

/**
 * @swagger
 * /cart/apply-giftcard:
 *   post:
 *     summary: Aplica bonos del wallet del usuario al total del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Resumen del carrito con los bonos aplicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appliedAmount:
 *                   type: number
 *                   example: 1000
 *                 walletBalance:
 *                   type: number
 *                   example: 49000
 *       400:
 *         description: Monto inválido o saldo insuficiente en el wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/apply-giftcard', requireAuth, cartController.applyGiftcard);

/**
 * Endpoints específicos de Confitería en el Carrito (HU-012)
 */
router.post('/snacks', requireAuth, snackController.addSnackToCart);
router.get('/snacks', requireAuth, snackController.getCart);
router.put('/snacks/:cartItemId', requireAuth, snackController.updateCartItem);
router.delete('/snacks/:cartItemId', requireAuth, snackController.removeCartItem);

export default router;
