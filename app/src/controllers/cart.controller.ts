// app/src/controllers/cart.controller.ts

import { Request, Response } from 'express';
import { CartDomainError } from '../errors/cart.errors';
import cartService from '../services/cart.service';
import { CreateCartRequestDto } from '../dto/request/create-cart.dto';
import { UpdateCartRequestDto } from '../dto/request/update-cart.dto';
import { ApplyGiftcardRequestDto } from '../dto/request/apply-giftcard.dto';

/**
 * ============================================================================
 * Controlador del Carrito de Compras (HU-011)
 * ============================================================================
 *
 * Gestiona las solicitudes HTTP relacionadas con el carrito de compras
 * temporal del usuario: creación a partir de la selección de sillas,
 * administración de entradas y confitería, aplicación de descuentos de
 * membresía (RN-047) y bonos (giftcard), expiración y liberación de sillas.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * CartController
 *      │
 * CartService
 *      │
 * CartRepository ─┐
 *      │           ├─ ReservationService (bloqueo/liberación de sillas)
 * ReservationRepo  ┘
 *      │
 * Sequelize → PostgreSQL
 *
 * Convenciones de errores:
 * Los errores de negocio se modelan como `CartDomainError` (ver
 * `src/errors/cart.errors.ts`) y se traducen aquí a su código HTTP y un
 * `code` estable para el cliente (404/409/410/422/500), en lugar de
 * inspeccionar cadenas de texto.
 */

/**
 * Traduce los errores de la capa de servicios a respuestas HTTP.
 *
 * Los `CartDomainError` se mapean con `instanceof` a su estado y código
 * correspondientes; cualquier otro error se trata como 500.
 */
const handle_error = (res: Response, error: unknown): Response => {
  if (error instanceof CartDomainError) {
    return res.status(error.status).json({ message: error.message, code: error.code });
  }

  const message = error instanceof Error ? error.message : 'Error interno del servidor';

  return res.status(500).json({ message });
};

/**
 * POST /api/v1/cart
 *
 * Crea el carrito activo del usuario a partir de la selección de sillas de
 * una función. Bloquea las sillas seleccionadas (RN-045) y calcula el
 * resumen económico inicial.
 *
 * @async
 *
 * @param {Request} req
 * Espera en el body:
 * @example
 * {
 *   "functionId": 12,
 *   "seatIds": [5, 6]
 * }
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **201 Created** Carrito creado con su resumen.
 * - **400 Bad Request** `functionId` o `seatIds` ausentes.
 * - **404 Not Found** (SNACK_NOT_FOUND) si algún producto no existe.
 * - **409 Conflict** (DUPLICATE_CART) si ya existe un carrito activo.
 * - **409 Conflict** (OUT_OF_STOCK) si una silla/producto está agotado.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {DuplicateCartError} Ya existe un carrito activo (RN-044).
 * @throws {CartDomainError} Cualquier error de negocio del servicio.
 */
export const createCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const dto: CreateCartRequestDto = {
      functionId: Number(req.body.functionId),
      seatIds: Array.isArray(req.body.seatIds) ? req.body.seatIds.map(Number) : [],
    };

    if (!dto.functionId || dto.seatIds.length === 0) {
      return res.status(400).json({ message: 'functionId y seatIds son obligatorios.' });
    }

    const cart = await cartService.create(req.userId as number, dto);

    return res.status(201).json(cart);
  } catch (error) {
    return handle_error(res, error);
  }
};

/**
 * GET /api/v1/cart
 *
 * Obtiene el detalle completo del carrito activo con su resumen económico
 * (subtotal, descuentos de membresía y promociones, bonos, impuestos y
 * total). El descuento de membresía se calcula automáticamente (RN-047).
 *
 * @async
 *
 * @param {Request} req
 * No requiere body.
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **200 OK** Detalle del carrito.
 * - **404 Not Found** (CART_NOT_FOUND) si no hay carrito activo.
 * - **410 Gone** (CART_EXPIRED) si el carrito venció.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {CartNotFoundError} No existe un carrito activo.
 * @throws {CartExpiredError} El carrito ha expirado (RN-046).
 */
export const getCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const cart = await cartService.getDetail(req.userId as number);

    return res.status(200).json(cart);
  } catch (error) {
    return handle_error(res, error);
  }
};

/**
 * PUT /api/v1/cart
 *
 * Modifica cantidades de confitería y/o quita entradas del carrito activo.
 * Renueva la expiración del carrito en cada modificación.
 *
 * @async
 *
 * @param {Request} req
 * Espera en el body (ambos opcionales):
 * @example
 * {
 *   "snacks": [{ "snackId": 3, "quantity": 2 }],
 *   "removeTicketIds": [7]
 * }
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **200 OK** Carrito actualizado con su resumen.
 * - **404 Not Found** (CART_NOT_FOUND) si no hay carrito activo.
 * - **404 Not Found** (TICKET_NOT_BELONGS) si la entrada no pertenece al carrito.
 * - **409 Conflict** (OUT_OF_STOCK) si un producto está agotado.
 * - **422 Unprocessable Entity** (INSUFFICIENT_STOCK) si excede el stock.
 * - **422 Unprocessable Entity** (NEGATIVE_QUANTITY) si envía cantidades negativas.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {CartDomainError} Cualquier error de negocio del servicio.
 */
export const updateCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const dto: UpdateCartRequestDto = {
      snacks: Array.isArray(req.body.snacks)
        ? req.body.snacks.map((snack: { snackId: number; quantity: number }) => ({
            snackId: Number(snack.snackId),
            quantity: Number(snack.quantity),
          }))
        : undefined,
      removeTicketIds: Array.isArray(req.body.removeTicketIds)
        ? req.body.removeTicketIds.map(Number)
        : undefined,
    };

    const cart = await cartService.update(req.userId as number, dto);

    return res.status(200).json(cart);
  } catch (error) {
    return handle_error(res, error);
  }
};

/**
 * DELETE /api/v1/cart
 *
 * Cancela el carrito activo y libera las sillas reservadas (RN-045).
 *
 * @async
 *
 * @param {Request} req
 * No requiere body.
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **200 OK** `{ cartId }` del carrito cancelado.
 * - **404 Not Found** (CART_NOT_FOUND) si no hay carrito activo.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {CartNotFoundError} No existe un carrito activo.
 */
export const deleteCart = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await cartService.remove(req.userId as number);

    return res.status(200).json(result);
  } catch (error) {
    return handle_error(res, error);
  }
};

/**
 * POST /api/v1/cart/apply-membership
 *
 * Calcula y retorna el descuento de membresía aplicable al carrito activo
 * (RN-047). Nota: el descuento ya se calcula automáticamente en el resumen
 * del carrito (create/get/update); este endpoint únicamente lo expone.
 *
 * @async
 *
 * @param {Request} req
 * No requiere body.
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **200 OK** `{ discountPercentage, discountAmount }`.
 * - **404 Not Found** (CART_NOT_FOUND) si no hay carrito activo.
 * - **410 Gone** (CART_EXPIRED) si el carrito venció.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {CartNotFoundError} No existe un carrito activo.
 * @throws {CartExpiredError} El carrito ha expirado.
 */
export const applyMembership = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await cartService.applyMembership(req.userId as number);

    return res.status(200).json(result);
  } catch (error) {
    return handle_error(res, error);
  }
};

/**
 * POST /api/v1/cart/apply-giftcard
 *
 * Aplica bonos del wallet del usuario al total del carrito.
 *
 * @async
 *
 * @param {Request} req
 * Espera en el body:
 * @example
 * { "amount": 5000 }
 *
 * @param {Response} res
 *
 * @returns {Promise<Response>}
 *
 * Respuestas:
 * - **200 OK** `{ appliedAmount, walletBalance }`.
 * - **404 Not Found** (CART_NOT_FOUND) si no hay carrito activo.
 * - **404 Not Found** (WALLET_NOT_FOUND) si el usuario no tiene billetera.
 * - **422 Unprocessable Entity** (INVALID_AMOUNT) si el monto no es > 0.
 * - **422 Unprocessable Entity** (INSUFFICIENT_BALANCE) si el saldo es insuficiente.
 * - **500 Internal Server Error** error inesperado.
 *
 * @throws {CartDomainError} Cualquier error de negocio del servicio.
 */
export const applyGiftcard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const dto: ApplyGiftcardRequestDto = { amount: Number(req.body.amount) };

    const result = await cartService.applyGiftcard(req.userId as number, dto);

    return res.status(200).json(result);
  } catch (error) {
    return handle_error(res, error);
  }
};
