// app/src/repositories/interfaces/cart.repository.interface.ts

/**
 * Contrato del repositorio de carrito de compras.
 *
 * Define las operaciones de persistencia para la entidad Cart y sus
 * elementos asociados (entradas y productos de confitería).
 */
import { Transaction } from 'sequelize';
import Cart, { CartCreationAttributes } from '../../models/cart.model.js';
import Snack from '../../models/snack.model.js';
import Promotion from '../../models/promotion.model.js';
import type { CartItem } from '../../models/cart-item.model.js';
import type { CartTicket } from '../../models/cart-ticket.model.js';

export interface CartDetailInclude {
  items: boolean;
  tickets: boolean;
}

export interface ICartRepository {
  /** Busca el carrito activo de un usuario. */
  findActiveByUserId(userId: number): Promise<Cart | null>;

  /** Busca el carrito activo de un usuario o lo crea si no existe. */
  findOrCreateActiveByUserId(userId: number, expiresAt?: Date): Promise<Cart>;

  /** Obtiene el carrito activo del usuario con sus ítems de confitería y productos asociados. */
  findWithItems(userId: number): Promise<Cart | null>;

  /** Busca un carrito por su identificador. */
  findById(cartId: number): Promise<Cart | null>;

  /** Busca un carrito con todos sus elementos cargados. */
  findDetailById(cartId: number): Promise<Cart | null>;

  /** Crea un nuevo carrito. */
  create(data: CartCreationAttributes, transaction?: Transaction): Promise<Cart>;

  /** Actualiza campos parciales del carrito (estado, expiración, bonos). */
  update(
    cartId: number,
    data: Partial<Pick<Cart, 'status' | 'expiresAt' | 'giftcardAmount'>>,
    transaction?: Transaction,
  ): Promise<void>;

  /** Elimina físicamente un carrito junto con sus elementos. */
  remove(cartId: number, transaction?: Transaction): Promise<void>;

  /** Agrega una entrada al carrito. */
  addTicket(
    data: {
      cartId: number;
      functionId: number;
      reservationId: number;
      quantity: number;
      unitPrice: number;
      total: number;
    },
    transaction?: Transaction,
  ): Promise<CartTicket>;

  /** Busca una entrada del carrito por su identificador. */
  findTicketById(ticketId: number): Promise<CartTicket | null>;

  /** Elimina una entrada del carrito. */
  removeTicket(ticketId: number, transaction?: Transaction): Promise<void>;

  /** Busca todos los carritos activos ya vencidos (para el job de expiración). */
  findExpiredActive(now: Date): Promise<Cart[]>;

  /** Busca un ítem de confitería del carrito por producto. */
  findItemByCartAndSnack(cartId: number, snackId: number): Promise<CartItem | null>;

  /** Agrega un ítem de confitería al carrito. */
  createItem(
    data: {
      cartId: number;
      snackId: number;
      quantity: number;
      unitPrice: number;
    },
    transaction?: Transaction,
  ): Promise<CartItem>;

  /** Actualiza cantidad y precio unitario de un ítem de confitería. */
  updateItem(itemId: number, data: { quantity: number; unitPrice: number }): Promise<void>;

  /** Elimina un ítem de confitería del carrito. */
  removeItem(itemId: number): Promise<void>;

  /**
   * Devuelve el porcentaje de descuento del nivel de membresía activa del
   * usuario (RN-047). Si no tiene membresía activa devuelve 0.
   */
  findActiveMembershipDiscountByUserId(userId: number): Promise<number>;
}

export interface ICartSnackRepository {
  /** Busca un producto de confitería por su identificador. */
  findById(snackId: number): Promise<Snack | null>;

  /** Busca las promociones activas vigentes de un producto. */
  findActivePromotionsBySnackId(snackId: number, now: Date): Promise<Promotion[]>;
}

export { type CartStatus } from '../../models/cart.model.js';
export { type CartItem } from '../../models/cart-item.model.js';
export { type CartTicket } from '../../models/cart-ticket.model.js';
