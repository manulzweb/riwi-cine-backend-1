// app/src/repositories/cart-item.repository.ts

import { CartItem, CartItemCreationAttributes } from '../models/cart-item.model';
import { ICartItemRepository } from './interfaces/cart-item.repository.interface';

/**
 * Repositorio de Ítems de Carrito
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad CartItem.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class CartItemRepository implements ICartItemRepository {
  /**
   * Busca un ítem de carrito por su identificador.
   *
   * Retorna `null` cuando no existe un ítem con el id proporcionado.
   */
  async findById(id: number): Promise<CartItem | null> {
    return await CartItem.findByPk(id);
  }

  /**
   * Busca un ítem de carrito por el carrito al que pertenece y el
   * producto de confitería asociado.
   *
   * Retorna `null` cuando el producto no está en el carrito indicado.
   */
  async findByCartAndSnack(cartId: number, snackId: number): Promise<CartItem | null> {
    return await CartItem.findOne({ where: { cartId, snackId } });
  }

  /**
   * Busca un ítem de carrito por su identificador y el carrito al que
   * pertenece.
   *
   * Esta operación garantiza que un usuario no pueda modificar ítems
   * de otro carrito.
   *
   * Retorna `null` cuando el ítem no existe o no pertenece al carrito.
   */
  async findByCartItemIdAndCartId(cartItemId: number, cartId: number): Promise<CartItem | null> {
    return await CartItem.findOne({ where: { id: cartItemId, cartId } });
  }

  /**
   * Crea un nuevo ítem de carrito.
   */
  async create(data: CartItemCreationAttributes): Promise<CartItem> {
    return await CartItem.create(data);
  }

  /**
   * Elimina un ítem de carrito.
   *
   * La eliminación se realiza sobre la instancia proporcionada.
   */
  async destroy(cartItem: CartItem): Promise<void> {
    await cartItem.destroy();
  }
}

export default new CartItemRepository();
