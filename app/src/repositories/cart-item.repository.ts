// app/src/repositories/cart-item.repository.ts

import { Transaction } from 'sequelize';
import {
  CartItem,
  CartItemAttributes,
  CartItemCreationAttributes,
} from '../models/cart-item.model.js';
import { ICartItemRepository } from './interfaces/cart-item.repository.interface.js';

/**
 * Repositorio de Ítems de Carrito
 * --------------------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad `CartItem`.
 *
 * Esta clase es la única responsable de interactuar con Sequelize para
 * los ítems de confitería añadidos a un carrito.
 */
class CartItemRepository implements ICartItemRepository {
  /**
   * Busca un ítem de carrito por su identificador.
   */
  async findById(id: number): Promise<CartItem | null> {
    return await CartItem.findByPk(id);
  }

  /**
   * Busca un ítem de carrito por el carrito al que pertenece y el
   * producto de confitería asociado.
   */
  async findByCartAndSnack(cartId: number, snackId: number): Promise<CartItem | null> {
    return await CartItem.findOne({ where: { cartId, snackId } });
  }

  /**
   * Busca un ítem de carrito por su identificador y el carrito al que
   * pertenece. Garantiza que un usuario no pueda modificar ítems de otro carrito.
   */
  async findByCartItemIdAndCartId(cartItemId: number, cartId: number): Promise<CartItem | null> {
    return await CartItem.findOne({ where: { id: cartItemId, cartId } });
  }

  /**
   * Crea un nuevo ítem de carrito.
   */
  async create(data: CartItemCreationAttributes, transaction?: Transaction): Promise<CartItem> {
    return await CartItem.create(data, { transaction });
  }

  /**
   * Actualiza los atributos de un ítem de carrito existente.
   */
  async update(
    cartItemId: number,
    data: Partial<Pick<CartItemAttributes, 'quantity' | 'unitPrice'>>,
    transaction?: Transaction,
  ): Promise<void> {
    await CartItem.update(data, { where: { id: cartItemId }, transaction });
  }

  /**
   * Elimina un ítem de carrito.
   */
  async destroy(cartItem: CartItem, transaction?: Transaction): Promise<void> {
    await cartItem.destroy({ transaction });
  }
}

export default CartItemRepository;
