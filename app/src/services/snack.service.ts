// app/src/services/snack.service.ts

import { Op } from 'sequelize';
import { Snack } from '../models/snack.model';
import { Cart } from '../models/cart.model';
import { CartItem } from '../models/cart-item.model';
import { Promotion } from '../models/promotion.model';
import User from '../models/user.model';
import { ISnackService } from './interfaces/snack.service.interface'; // <-- Importamos tu nueva interfaz
import { AddToCartDto, UpdateCartItemDto } from '../dto/snack-cart.dto';

/**
 * Servicio de Confitería
 * ---------------------
 * Implementa el contrato `ISnackService` para asegurar la consistencia arquitectónica del proyecto.
 *
 * Cubre la HU-012:
 *  - Catálogo de productos (TASK 1).
 *  - Consulta de disponibilidad (TASK 3).
 *  - Agregar productos al carrito (TASK 4).
 *  - Actualización de cantidades (TASK 5).
 *  - Eliminación de productos (TASK 6).
 *  - Promociones y descuentos (TASK 7).
 *  - Integración con inventario (TASK 8 / RN-049).
 */
export class SnackService implements ISnackService {
  /**
   * Consulta la base de datos para retornar los productos de confitería.
   * Cada producto incluye el precio efectivo (`finalPrice`) calculado a partir
   * de la promoción vigente o del descuento base del producto.
   */
  async getAll(category?: string): Promise<any[]> {
    const whereCondition = category ? { category } : {};

    const snacks = await Snack.findAll({
      where: whereCondition,
      order: [['name', 'ASC']],
    });

    return await Promise.all(
      snacks.map(async (snack) => {
        const finalPrice = await this.getEffectivePrice(snack);
        return {
          ...snack.toJSON(),
          finalPrice,
          available: snack.stock > 0,
        };
      })
    );
  }

  /**
   * Obtiene la disponibilidad de todos los productos de confitería.
   * Permite al usuario consultar qué productos están disponibles antes de agregarlos.
   */
  async getAvailability(): Promise<any[]> {
    const snacks = await Snack.findAll({
      order: [['name', 'ASC']],
    });

    return snacks.map((snack) => ({
      id: snack.id,
      name: snack.name,
      category: snack.category,
      stock: snack.stock,
      available: snack.stock > 0, // RN-049: un producto está disponible si tiene stock mayor a cero
    }));
  }

  /**
   * Valida el inventario (RN-049), respeta promociones y añade un producto
   * de confitería al carrito de compras del usuario.
   *
   * Reglas aplicadas:
   *  - La cantidad debe ser un entero mayor a cero.
   *  - El usuario debe existir.
   *  - El producto debe existir.
   *  - No se permite agregar productos agotados ni superar el stock disponible.
   */
  async addToCart(dto: AddToCartDto): Promise<CartItem> {
    const { userId, snackId, quantity } = dto;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor a cero.');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('El usuario no existe.');
    }

    const snack = await Snack.findByPk(snackId);
    if (!snack) {
      throw new Error('El producto de confitería solicitado no existe.');
    }

    const [cart] = await Cart.findOrCreate({ where: { userId } });

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, snackId },
    });

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    if (snack.stock < totalRequested || snack.stock === 0) {
      throw new Error(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`
      );
    }

    const unitPrice = await this.getEffectivePrice(snack);

    if (existingItem) {
      existingItem.quantity = totalRequested;
      existingItem.unitPrice = unitPrice;
      return await existingItem.save();
    }

    return await CartItem.create({
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
   *  - El ítem debe pertenecer al carrito del usuario.
   *  - La cantidad debe ser un entero mayor a cero.
   *  - No se permite superar el stock disponible (RN-049).
   */
  async updateCartItem(userId: number, cartItemId: number, dto: UpdateCartItemDto): Promise<CartItem> {
    const { quantity } = dto;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor a cero.');
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new Error('El carrito no existe.');
    }

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });
    if (!cartItem) {
      throw new Error('El ítem del carrito no existe o no pertenece al usuario.');
    }

    const snack = await Snack.findByPk(cartItem.snackId);
    if (!snack) {
      throw new Error('El producto de confitería solicitado no existe.');
    }

    if (snack.stock < quantity || snack.stock === 0) {
      throw new Error(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`
      );
    }

    cartItem.quantity = quantity;
    return await cartItem.save();
  }

  /**
   * Elimina un producto de confitería del carrito.
   * El ítem debe pertenecer al carrito del usuario.
   */
  async removeCartItem(userId: number, cartItemId: number): Promise<void> {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new Error('El carrito no existe.');
    }

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });
    if (!cartItem) {
      throw new Error('El ítem del carrito no existe o no pertenece al usuario.');
    }

    await cartItem.destroy();
  }

  /**
   * Obtiene el carrito del usuario con sus ítems y el valor total,
   * respetando las promociones y descuentos aplicados al agregar cada producto.
   */
  async getCart(userId: number): Promise<any> {
    const cart = await Cart.findOne({
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

    if (!cart) {
      return { cartId: null, items: [], total: 0 };
    }

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

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return { cartId: cart.id, items, total };
  }

  /**
   * Calcula el precio efectivo de un producto de confitería.
   *
   * Prioridad de descuentos (TASK 7):
   *  1. Si existe una promoción activa (dentro de fechas) → se aplica su descuento.
   *  2. Si no hay promoción → se aplica el descuento base del producto.
   *  3. En caso contrario → precio normal.
   */
  private async getEffectivePrice(snack: Snack): Promise<number> {
    const now = new Date();

    const activePromotion = await Promotion.findOne({
      where: {
        snackId: snack.id,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      order: [['endDate', 'DESC']],
    });

    const basePrice = Number(snack.price);

    if (activePromotion) {
      const value = Number(activePromotion.discountValue);
      if (activePromotion.discountType === 'percent') {
        return Math.round(basePrice * (1 - value / 100) * 100) / 100;
      }
      return Math.max(0, Math.round((basePrice - value) * 100) / 100);
    }

    const discount = Number(snack.discountPercentage);
    if (discount > 0) {
      return Math.round(basePrice * (1 - discount / 100) * 100) / 100;
    }

    return basePrice;
  }
}