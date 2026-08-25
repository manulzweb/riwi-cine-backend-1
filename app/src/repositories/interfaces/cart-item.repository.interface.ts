import { CartItem, CartItemCreationAttributes } from '../../models/cart-item.model';

/**
 * Contrato del Repositorio de Ítems de Carrito.
 *
 * Define la capa de persistencia para la entidad CartItem. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface ICartItemRepository {
  /**
   * Busca un ítem de carrito por su identificador.
   */
  findById(id: number): Promise<CartItem | null>;

  /**
   * Busca un ítem de carrito por el carrito y el producto de confitería.
   */
  findByCartAndSnack(cartId: number, snackId: number): Promise<CartItem | null>;

  /**
   * Busca un ítem de carrito por su identificador y el carrito al que pertenece.
   */
  findByCartItemIdAndCartId(cartItemId: number, cartId: number): Promise<CartItem | null>;

  /**
   * Crea un nuevo ítem de carrito.
   */
  create(data: CartItemCreationAttributes): Promise<CartItem>;

  /**
   * Elimina un ítem de carrito.
   */
  destroy(cartItem: CartItem): Promise<void>;
}
