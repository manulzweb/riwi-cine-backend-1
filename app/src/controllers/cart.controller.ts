// app/src/controllers/cart.controller.ts

import { Request, Response } from 'express';
import { ICartService } from '../services/interfaces/cart.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { CreateCartRequestDto } from '../dto/request/create-cart.dto.js';
import { UpdateCartRequestDto } from '../dto/request/update-cart.dto.js';
import { ApplyGiftcardRequestDto } from '../dto/request/apply-giftcard.dto.js';

/**
 * ============================================================================
 * Controlador del Carrito de Compras (HU-011)
 * ============================================================================
 *
 * Gestiona las solicitudes HTTP relacionadas con el carrito de compras
 * temporal del usuario: creación a partir de la selección de sillas,
 * administración de entradas y confitería, aplicación de descuentos de
 * membresía (RN-047) y bonos (giftcard), expiración y cancelación.
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → CartController → CartService → Repositories → PostgreSQL
 * ============================================================================
 */
export class CartController {
  constructor(private readonly cartService: ICartService) {}

  /**
   * POST /cart
   * Crea el carrito activo del usuario a partir de la selección de sillas de una función.
   */
  public create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: CreateCartRequestDto = {
      functionId: Number.parseInt(req.body.functionId, 10),
      seatIds: Array.isArray(req.body.seatIds)
        ? req.body.seatIds.map((id: unknown) => Number.parseInt(String(id), 10))
        : [],
    };

    if (!dto.functionId || dto.seatIds.length === 0) {
      res
        .status(400)
        .json({ error: 'VALIDATION_ERROR', message: 'functionId y seatIds son obligatorios.' });
      return;
    }

    const cart = await this.cartService.create(req.userId as number, dto);
    res.status(201).json(cart);
  });

  /**
   * GET /cart
   * Obtiene el detalle completo del carrito activo con su resumen económico.
   */
  public getDetail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const cart = await this.cartService.getDetail(req.userId as number);
    res.status(200).json(cart);
  });

  /**
   * PUT /cart
   * Modifica cantidades de confitería y/o quita entradas del carrito activo.
   */
  public update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: UpdateCartRequestDto = {
      snacks: Array.isArray(req.body.snacks)
        ? req.body.snacks.map((snack: { snackId: unknown; quantity: unknown }) => ({
            snackId: Number.parseInt(String(snack.snackId), 10),
            quantity: Number.parseInt(String(snack.quantity), 10),
          }))
        : undefined,
      removeTicketIds: Array.isArray(req.body.removeTicketIds)
        ? req.body.removeTicketIds.map((id: unknown) => Number.parseInt(String(id), 10))
        : undefined,
    };

    const cart = await this.cartService.update(req.userId as number, dto);
    res.status(200).json(cart);
  });

  /**
   * DELETE /cart
   * Cancela el carrito activo y libera las sillas reservadas (RN-045).
   */
  public remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.cartService.remove(req.userId as number);
    res.status(200).json(result);
  });

  /**
   * POST /cart/apply-membership
   * Obtiene el descuento de membresía aplicable al carrito activo (RN-047).
   */
  public applyMembership = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.cartService.applyMembership(req.userId as number);
    res.status(200).json(result);
  });

  /**
   * POST /cart/apply-giftcard
   * Aplica bonos del wallet del usuario al total del carrito.
   */
  public applyGiftcard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const amount = Number(req.body.amount);
    const dto: ApplyGiftcardRequestDto = { amount };

    const result = await this.cartService.applyGiftcard(req.userId as number, dto);
    res.status(200).json(result);
  });
}

export default CartController;
