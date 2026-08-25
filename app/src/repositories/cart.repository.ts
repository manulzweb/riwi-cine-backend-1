// app/src/repositories/cart.repository.ts

import { Op, Transaction } from 'sequelize';
import Cart from '../models/cart.model';
import { CartItem } from '../models/cart-item.model';
import { CartTicket } from '../models/cart-ticket.model';
import Snack from '../models/snack.model';
import Promotion from '../models/promotion.model';
import Membership from '../models/membership.model';
import MembershipLevel from '../models/membership-level.model';
import MembershipStatus from '../models/membership-status.model';
import { ICartRepository, ISnackRepository } from './interfaces/cart.repository.interface';

/**
 * Repositorio del carrito de compras.
 *
 * Encapsula todas las consultas de Sequelize relacionadas con el carrito,
 * sus entradas (CartTicket) y sus productos de confitería (CartItem).
 */
class CartRepository implements ICartRepository {
  async findActiveByUserId(userId: number): Promise<Cart | null> {
    return await Cart.findOne({
      where: { userId, status: 'ACTIVE' },
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(cartId: number): Promise<Cart | null> {
    return await Cart.findByPk(cartId);
  }

  async findDetailById(cartId: number): Promise<Cart | null> {
    return await Cart.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Snack,
              as: 'snack',
              include: [{ model: Promotion, as: 'promotions' }],
            },
          ],
        },
        {
          model: CartTicket,
          as: 'tickets',
          include: [
            { association: 'function', include: [{ association: 'movie' }] },
            {
              association: 'reservation',
              include: [{ association: 'reservationSeats', include: [{ association: 'seat' }] }],
            },
          ],
        },
      ],
    });
  }

  async create(
    data: {
      userId: number;
      status?: 'ACTIVE' | 'EXPIRED' | 'CONVERTED';
      expiresAt?: Date | null;
    },
    transaction?: Transaction,
  ): Promise<Cart> {
    return await Cart.create(data, { transaction });
  }

  async update(
    cartId: number,
    data: Partial<Pick<Cart, 'status' | 'expiresAt' | 'giftcardAmount'>>,
    transaction?: Transaction,
  ): Promise<void> {
    await Cart.update(data, { where: { id: cartId }, transaction });
  }

  async remove(cartId: number, transaction?: Transaction): Promise<void> {
    await CartTicket.destroy({ where: { cartId }, transaction });
    await CartItem.destroy({ where: { cartId }, transaction });
    await Cart.destroy({ where: { id: cartId }, transaction });
  }

  async addTicket(
    data: {
      cartId: number;
      functionId: number;
      reservationId: number;
      quantity: number;
      unitPrice: number;
      total: number;
    },
    transaction?: Transaction,
  ): Promise<CartTicket> {
    return await CartTicket.create(data, { transaction });
  }

  async findTicketById(ticketId: number): Promise<CartTicket | null> {
    return await CartTicket.findByPk(ticketId);
  }

  async removeTicket(ticketId: number, transaction?: Transaction): Promise<void> {
    await CartTicket.destroy({ where: { id: ticketId }, transaction });
  }

  async findExpiredActive(now: Date): Promise<Cart[]> {
    return await Cart.findAll({
      where: { status: 'ACTIVE', expiresAt: { [Op.lt]: now } },
    });
  }

  async findItemByCartAndSnack(cartId: number, snackId: number): Promise<CartItem | null> {
    return await CartItem.findOne({ where: { cartId, snackId } });
  }

  async createItem(
    data: { cartId: number; snackId: number; quantity: number; unitPrice: number },
    transaction?: Transaction,
  ): Promise<CartItem> {
    return await CartItem.create(data, { transaction });
  }

  async updateItem(itemId: number, data: { quantity: number; unitPrice: number }): Promise<void> {
    await CartItem.update(data, { where: { id: itemId } });
  }

  async removeItem(itemId: number): Promise<void> {
    await CartItem.destroy({ where: { id: itemId } });
  }

  async findActiveMembershipDiscountByUserId(userId: number): Promise<number> {
    const membership = await Membership.findOne({
      where: { userId },
      include: [
        {
          model: MembershipStatus,
          as: 'status',
          where: { name: 'Activa' },
        },
      ],
    });

    if (!membership) return 0;

    const level = (await MembershipLevel.findByPk(membership.levelId)) as {
      discountPercentage?: number | string;
    } | null;

    return Number(level?.discountPercentage ?? 0);
  }
}

/**
 * Repositorio de confitería.
 *
 * Consultas de solo lectura sobre Snack y Promotion para validar
 * disponibilidad y promociones vigentes al administrar el carrito.
 */
class SnackRepository implements ISnackRepository {
  async findById(snackId: number): Promise<Snack | null> {
    return await Snack.findByPk(snackId);
  }

  async findActivePromotionsBySnackId(snackId: number, now: Date): Promise<Promotion[]> {
    return await Promotion.findAll({
      where: {
        snackId,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
    });
  }
}

export const snackRepository = new SnackRepository();
export default new CartRepository();
