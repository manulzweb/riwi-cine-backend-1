// app/src/controllers/snack.controller.ts

import { Request, Response } from 'express';
import { ISnackService } from '../services/interfaces/snack.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  InvalidSnackIdError,
  InvalidCartItemIdError,
  InvalidQuantityError,
  UserIdRequiredError,
} from '../errors/snack.errors.js';
import { AddToCartDto, UpdateCartItemDto } from '../dto/snack-cart.dto.js';

/**
 * ============================================================================
 * Controlador de Confitería (HU-012)
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la
 * confitería y la administración de snacks en el carrito de compras.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio
 * al `SnackService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente (body, query params, params).
 *  - Realizar validaciones básicas de tipo y formato antes de delegar.
 *  - Invocar el servicio correspondiente inyectado en el constructor.
 *  - Construir la respuesta HTTP estandarizada.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio (validación de stock, cálculo de descuentos, etc.).
 *  - Acceder directamente a la base de datos ni a Sequelize.
 *  - Realizar bloques try/catch manuales (delegado a `asyncHandler`).
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * Container (wiring)
 *      │
 * SnackController
 *      │
 * SnackService
 *      │
 * SnackRepository / PromotionRepository / CartRepository / CartItemRepository
 *      │
 * Sequelize → PostgreSQL
 * ============================================================================
 */
export class SnackController {
  constructor(private readonly snackService: ISnackService) {}

  /**
   * Helper privado para resolver el `userId` únicamente desde el token JWT (`req.userId`).
   */
  private extractUserId(req: Request): number {
    const rawId = req.userId;

    if (!rawId || Number.isNaN(rawId) || rawId <= 0) {
      throw new UserIdRequiredError();
    }

    return rawId;
  }

  /**
   * GET /api/v1/snacks
   * Obtiene el catálogo de confitería con precios calculados y disponibilidad.
   * Filtro opcional por `category`.
   */
  public getAllSnacks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const data = await this.snackService.getAll(category);

    res.status(200).json(data);
  });

  /**
   * GET /api/v1/snacks/categories
   * Obtiene la lista de categorías disponibles para los productos de confitería.
   */
  public getCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const data = await this.snackService.getCategories();

    res.status(200).json(data);
  });

  /**
   * GET /api/v1/snacks/availability
   * Obtiene la disponibilidad de inventario en tiempo real de los snacks (RN-049).
   */
  public getSnackAvailability = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const data = await this.snackService.getAvailability();

      res.status(200).json(data);
    },
  );

  /**
   * GET /api/v1/snacks/:id
   * Obtiene el detalle de un producto específico de confitería.
   */
  public getSnackById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      throw new InvalidSnackIdError();
    }

    const data = await this.snackService.getById(id);

    res.status(200).json(data);
  });

  /**
   * POST /api/v1/snacks/cart
   * Añade una cantidad de un producto de confitería al carrito activo del usuario.
   */
  public addSnackToCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.extractUserId(req);

    const snackId = Number.parseInt(String(req.body.snackId), 10);
    if (Number.isNaN(snackId) || snackId <= 0) {
      throw new InvalidSnackIdError();
    }

    const quantity = Number.parseInt(String(req.body.quantity), 10);
    if (Number.isNaN(quantity) || quantity <= 0) {
      throw new InvalidQuantityError();
    }

    const dto: AddToCartDto = { userId, snackId, quantity };
    const cartItem = await this.snackService.addToCart(dto);

    res.status(201).json({
      message: 'Producto agregado al carrito con éxito.',
      data: cartItem,
    });
  });

  /**
   * GET /api/v1/snacks/cart
   * Obtiene los productos de confitería en el carrito activo del usuario y el total.
   */
  public getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.extractUserId(req);
    const data = await this.snackService.getCart(userId);

    res.status(200).json(data);
  });

  /**
   * PUT /api/v1/snacks/cart/:cartItemId
   * Actualiza la cantidad de un ítem de confitería del carrito validando stock (RN-049).
   */
  public updateCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.extractUserId(req);

    const cartItemId = Number.parseInt(req.params.cartItemId, 10);
    if (Number.isNaN(cartItemId) || cartItemId <= 0) {
      throw new InvalidCartItemIdError();
    }

    const quantity = Number.parseInt(String(req.body.quantity), 10);
    if (Number.isNaN(quantity) || quantity <= 0) {
      throw new InvalidQuantityError();
    }

    const dto: UpdateCartItemDto = { quantity };
    const updated = await this.snackService.updateCartItem(userId, cartItemId, dto);

    res.status(200).json({
      message: 'Cantidad actualizada con éxito.',
      data: updated,
    });
  });

  /**
   * DELETE /api/v1/snacks/cart/:cartItemId
   * Elimina un producto de confitería del carrito del usuario.
   */
  public removeCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.extractUserId(req);

    const cartItemId = Number.parseInt(req.params.cartItemId, 10);
    if (Number.isNaN(cartItemId) || cartItemId <= 0) {
      throw new InvalidCartItemIdError();
    }

    await this.snackService.removeCartItem(userId, cartItemId);

    res.status(200).json({
      message: 'Producto eliminado del carrito con éxito.',
    });
  });
}
