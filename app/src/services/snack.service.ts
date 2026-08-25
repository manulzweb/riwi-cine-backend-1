// app/src/services/snack.service.ts

import type { Snack } from '../models/snack.model';
import type { CartItem } from '../models/cart-item.model';
import { ISnackService } from './interfaces/snack.service.interface';
import { AddToCartDto, UpdateCartItemDto } from '../dto/snack-cart.dto';

import snackRepository from '../repositories/snack.repository';
import cartRepository from '../repositories/cart.repository';
import cartItemRepository from '../repositories/cart-item.repository';
import promotionRepository from '../repositories/promotion.repository';
import userRepository from '../repositories/user.repository';

/**
 * Servicio encargado de gestionar los procesos de confitería,
 * carrito de compras, promociones e inventario.
 *
 * Responsabilidades:
 * - Consultar el catálogo de productos de confitería con precios efectivos.
 * - Consultar la disponibilidad de inventario de los productos.
 * - Gestionar el carrito de compras (agregar, actualizar, eliminar ítems).
 * - Calcular precios efectivos aplicando promociones y descuentos vigentes.
 * - Validar la disponibilidad de inventario antes de permitir operaciones
 *   sobre el carrito (Regla de Negocio RN-049).
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas a los
 * correspondientes repositories.
 *
 * @class SnackService
 *
 * @security
 * La validación de inventario siempre se ejecuta antes de permitir
 * la adición o actualización de un producto al carrito, garantizando
 * la integridad del stock en concurrencia.
 */
class SnackService implements ISnackService {
  /**
   * Consulta el catálogo de productos de confitería.
   *
   * Cada producto incluye el precio efectivo (`finalPrice`) calculado
   * a partir de la promoción vigente o del descuento base del producto.
   *
   * Las operaciones de consulta son delegadas al `SnackRepository`.
   *
   * @param {string} [category]
   * Categoría por la cual filtrar los productos (opcional).
   * Ejemplos: "Combos", "Crispetas", "Bebidas", "Comida Rápida".
   *
   * @returns {Promise<any[]>}
   * Lista de productos de confitería con `finalPrice` y `available`.
   */
  async getAll(category?: string): Promise<any[]> {
    /**
     * 1. Obtener los productos de confitería mediante el Repository.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const snacks = await snackRepository.findAll(category);

    /**
     * 2. Calcular el precio efectivo de cada producto.
     *
     * Se itera sobre cada snack para obtener su precio con promociones
     * y descuentos aplicados.
     */
    return await Promise.all(
      snacks.map(async (snack) => {
        const finalPrice = await this.getEffectivePrice(snack);
        return {
          ...snack.toJSON(),
          finalPrice,
          available: snack.stock > 0,
        };
      }),
    );
  }

  /**
   * Obtiene la disponibilidad de todos los productos de confitería.
   *
   * Permite al usuario consultar qué productos están disponibles antes
   * de agregarlos al carrito.
   *
   * Regla de Negocio RN-049: Un producto está disponible si tiene
   * stock mayor a cero.
   *
   * @returns {Promise<any[]>}
   * Lista de productos con `id`, `name`, `category`, `stock` y `available`.
   */
  async getAvailability(): Promise<any[]> {
    /**
     * Obtener todos los productos de confitería mediante el Repository.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const snacks = await snackRepository.findAll();

    return snacks.map((snack) => ({
      id: snack.id,
      name: snack.name,
      category: snack.category,
      stock: snack.stock,
      available: snack.stock > 0,
    }));
  }

  /**
   * Valida el inventario (RN-049), respeta promociones y añade un producto
   * de confitería al carrito de compras del usuario.
   *
   * Reglas aplicadas:
   *  - La cantidad debe ser un entero mayor a cero.
   *  - El usuario debe existir en el sistema.
   *  - El producto de confitería debe existir.
   *  - No se permite agregar productos agotados ni superar el stock
   *    disponible (RN-049).
   *  - Si el producto ya está en el carrito, se suma la cantidad.
   *  - Se aplica el precio efectivo (con promociones/descuentos) como
   *    snapshot del precio unitario.
   *
   * @param {AddToCartDto} dto
   * Datos necesarios para agregar el producto al carrito: `userId`,
   * `snackId` y `quantity`.
   *
   * @returns {Promise<CartItem>}
   * El ítem del carrito creado o actualizado.
   *
   * @throws {Error}
   * Cuando la cantidad no es un entero mayor a cero.
   *
   * @throws {Error}
   * Cuando el usuario no existe en el sistema.
   *
   * @throws {Error}
   * Cuando el producto de confitería solicitado no existe.
   *
   * @throws {Error}
   * Cuando el stock es insuficiente o el producto se encuentra agotado.
   */
  async addToCart(dto: AddToCartDto): Promise<CartItem> {
    const { userId, snackId, quantity } = dto;

    /**
     * 1. Validar que la cantidad sea un entero mayor a cero.
     */
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor a cero.');
    }

    /**
     * 2. Verificar que el usuario exista en el sistema.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('El usuario no existe.');
    }

    /**
     * 3. Verificar que el producto de confitería exista.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const snack = await snackRepository.findById(snackId);
    if (!snack) {
      throw new Error('El producto de confitería solicitado no existe.');
    }

    /**
     * 4. Obtener o crear el carrito del usuario.
     *
     * Se utiliza `findOrCreate` para garantizar que exista un único
     * carrito por usuario.
     */
    const cart = await cartRepository.findOrCreateByUserId(userId);

    /**
     * 5. Verificar si el producto ya existe en el carrito.
     */
    const existingItem = await cartItemRepository.findByCartAndSnack(cart.id, snackId);

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    /**
     * 6. Validar la disponibilidad de inventario (RN-049).
     *
     * Se verifica que el stock sea mayor o igual a la cantidad total
     * solicitada (incluyendo la cantidad ya existente en el carrito).
     */
    if (snack.stock < totalRequested || snack.stock === 0) {
      throw new Error(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`,
      );
    }

    /**
     * 7. Calcular el precio efectivo del producto.
     *
     * Se obtiene el precio con promociones y descuentos aplicados
     * para guardarlo como snapshot en el ítem del carrito.
     */
    const unitPrice = await this.getEffectivePrice(snack);

    /**
     * 8. Actualizar el ítem existente o crear uno nuevo.
     */
    if (existingItem) {
      existingItem.quantity = totalRequested;
      existingItem.unitPrice = unitPrice;
      return await existingItem.save();
    }

    return await cartItemRepository.create({
      cartId: cart.id,
      snackId,
      quantity,
      unitPrice,
    });
  }

  /**
   * Actualiza la cantidad de un ítem del carrito.
   *
   * Reglas aplicadas:
   *  - La cantidad debe ser un entero mayor a cero.
   *  - El ítem debe pertenecer al carrito del usuario.
   *  - No se permite superar el stock disponible (RN-049).
   *
   * @param {number} userId
   * Identificador del usuario propietario del carrito.
   *
   * @param {number} cartItemId
   * Identificador del ítem del carrito a actualizar.
   *
   * @param {UpdateCartItemDto} dto
   * Datos con la nueva cantidad.
   *
   * @returns {Promise<CartItem>}
   * El ítem del carrito actualizado.
   *
   * @throws {Error}
   * Cuando la cantidad no es un entero mayor a cero.
   *
   * @throws {Error}
   * Cuando el carrito del usuario no existe.
   *
   * @throws {Error}
   * Cuando el ítem del carrito no existe o no pertenece al usuario.
   *
   * @throws {Error}
   * Cuando el producto de confitería asociado al ítem no existe.
   *
   * @throws {Error}
   * Cuando el stock es insuficiente o el producto se encuentra agotado.
   */
  async updateCartItem(userId: number, cartItemId: number, dto: UpdateCartItemDto): Promise<CartItem> {
    const { quantity } = dto;

    /**
     * 1. Validar que la cantidad sea un entero mayor a cero.
     */
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor a cero.');
    }

    /**
     * 2. Buscar el carrito del usuario.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('El carrito no existe.');
    }

    /**
     * 3. Buscar el ítem del carrito y verificar que pertenezca al usuario.
     */
    const cartItem = await cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.id);
    if (!cartItem) {
      throw new Error('El ítem del carrito no existe o no pertenece al usuario.');
    }

    /**
     * 4. Verificar que el producto de confitería asociado exista.
     */
    const snack = await snackRepository.findById(cartItem.snackId);
    if (!snack) {
      throw new Error('El producto de confitería solicitado no existe.');
    }

    /**
     * 5. Validar la disponibilidad de inventario (RN-049).
     *
     * Se verifica que el stock sea mayor o igual a la nueva cantidad
     * solicitada y que no sea igual a cero (agotado).
     */
    if (snack.stock < quantity || snack.stock === 0) {
      throw new Error(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`,
      );
    }

    /**
     * 6. Actualizar la cantidad del ítem.
     */
    cartItem.quantity = quantity;
    return await cartItem.save();
  }

  /**
   * Elimina un producto de confitería del carrito de compras.
   *
   * El ítem debe pertenecer al carrito del usuario para poder
   * ser eliminado.
   *
   * @param {number} userId
   * Identificador del usuario propietario del carrito.
   *
   * @param {number} cartItemId
   * Identificador del ítem del carrito a eliminar.
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   * Cuando el carrito del usuario no existe.
   *
   * @throws {Error}
   * Cuando el ítem del carrito no existe o no pertenece al usuario.
   */
  async removeCartItem(userId: number, cartItemId: number): Promise<void> {
    /**
     * 1. Buscar el carrito del usuario.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('El carrito no existe.');
    }

    /**
     * 2. Buscar el ítem del carrito y verificar que pertenezca al usuario.
     */
    const cartItem = await cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.id);
    if (!cartItem) {
      throw new Error('El ítem del carrito no existe o no pertenece al usuario.');
    }

    /**
     * 3. Eliminar el ítem del carrito.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    await cartItemRepository.destroy(cartItem);
  }

  /**
   * Obtiene el carrito del usuario con sus ítems y el valor total,
   * respetando las promociones y descuentos aplicados al agregar
   * cada producto.
   *
   * @param {number} userId
   * Identificador del usuario propietario del carrito.
   *
   * @returns {Promise<any>}
   * Objeto con `cartId`, `items` (lista de ítems con nombre, imagen,
   * cantidad, precio unitario y subtotal) y `total` (suma de subtotales).
   * Si el usuario no tiene carrito, retorna `cartId: null`, `items: []`
   * y `total: 0`.
   */
  async getCart(userId: number): Promise<any> {
    /**
     * 1. Obtener el carrito del usuario con sus ítems y productos.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const cart = await cartRepository.findWithItems(userId);

    if (!cart) {
      return { cartId: null, items: [], total: 0 };
    }

    /**
     * 2. Construir la lista de ítems con la información necesaria.
     *
     * Se extrae el nombre, imagen, cantidad, precio unitario y
     * subtotal de cada ítem.
     */
    const cartItems = cart.items ?? [];

    const items = cartItems.map((item) => ({
      cartItemId: item.id,
      snackId: item.snackId,
      name: item.snack?.name ?? null,
      imageUrl: item.snack?.imageUrl ?? null,
      quantity: item.quantity,
      priceUnit: Number(item.unitPrice),
      subtotal: Number(item.unitPrice) * item.quantity,
    }));

    /**
     * 3. Calcular el total del carrito.
     *
     * Se suma el subtotal de todos los ítems.
     */
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return { cartId: cart.id, items, total };
  }

  /**
   * Calcula el precio efectivo de un producto de confitería.
   *
   * Prioridad de descuentos (TASK 7):
   *  1. Si existe una promoción activa (dentro de fechas) → se aplica
   *     su descuento.
   *  2. Si no hay promoción → se aplica el descuento base del producto.
   *  3. En caso contrario → precio normal.
   *
   * @param {Snack} snack
   * Producto de confitería del cual se calculará el precio efectivo.
   *
   * @returns {Promise<number>}
   * Precio efectivo del producto con descuentos/promociones aplicados.
   */
  private async getEffectivePrice(snack: Snack): Promise<number> {
    /**
     * 1. Buscar una promoción activa para el producto.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     * El Repository valida que la promoción esté activa y dentro
     * de su rango de fechas.
     */
    const activePromotion = await promotionRepository.findActiveBySnackId(snack.id);

    const basePrice = Number(snack.price);

    /**
     * 2. Aplicar el descuento de la promoción si existe.
     *
     * Si el tipo de descuento es porcentual, se calcula el porcentaje.
     * Si es un valor fijo, se resta directamente del precio base.
     */
    if (activePromotion) {
      const value = Number(activePromotion.discountValue);
      if (activePromotion.discountType === 'percent') {
        return Math.round(basePrice * (1 - value / 100) * 100) / 100;
      }
      return Math.max(0, Math.round((basePrice - value) * 100) / 100);
    }

    /**
     * 3. Aplicar el descuento base del producto si no hay promoción.
     */
    const discount = Number(snack.discountPercentage);
    if (discount > 0) {
      return Math.round(basePrice * (1 - discount / 100) * 100) / 100;
    }

    /**
     * 4. Retornar el precio normal sin descuentos.
     */
    return basePrice;
  }
}

/**
 * Instancia única del servicio de confitería utilizada
 * por la aplicación.
 *
 * @constant
 * @type {SnackService}
 */
export default new SnackService();
