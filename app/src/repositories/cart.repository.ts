// app/src/repositories/cart.repository.ts

import { Cart } from '../models/cart.model';
import { CartItem } from '../models/cart-item.model';
import { Snack } from '../models/snack.model';
import { ICartRepository } from './interfaces/cart.repository.interface';

/**
 * Repositorio de Carrito
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Cart.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class CartRepository implements ICartRepository {
  /**
   * Busca un carrito por el identificador del usuario.
   *
   * Retorna `null` cuando el usuario no tiene un carrito registrado.
   */
  async findByUserId(userId: number): Promise<Cart | null> {
    return await Cart.findOne({ where: { userId } });
  }

  /**
   * Busca un carrito por el identificador del usuario, o lo crea
   * automáticamente si no existe.
   *
   * Retorna el carrito existente o el recién creado.
   */
  async findOrCreateByUserId(userId: number): Promise<Cart> {
    const [cart] = await Cart.findOrCreate({ where: { userId } });
    return cart;
  }

  /**
   * Obtiene el carrito del usuario con sus ítems y productos asociados.
   *
   * Incluye los `CartItem` y el `Snack` de cada ítem para construir
   * el carrito completo con nombres, imágenes y precios.
   */
  async findWithItems(userId: number): Promise<Cart | null> {
    return await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Snack,
              as: 'snack',
              attributes: ['id', 'name', 'description', 'imageUrl', 'category'],
            },
          ],
        },
      ],
    });
  }
}

export default new CartRepository();
