import { Cart } from '../../models/cart.model';
import { CartItem } from '../../models/cart-item.model';
import { Snack } from '../../models/snack.model';

/**
 * Contrato del Repositorio de Carrito.
 *
 * Define la capa de persistencia para la entidad Cart. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface ICartRepository {
  /**
   * Busca un carrito por el identificador del usuario.
   */
  findByUserId(userId: number): Promise<Cart | null>;

  /**
   * Busca un carrito por el identificador del usuario, o lo crea si no existe.
   */
  findOrCreateByUserId(userId: number): Promise<Cart>;

  /**
   * Obtiene el carrito del usuario con sus ítems y productos asociados.
   */
  findWithItems(userId: number): Promise<Cart | null>;
}
