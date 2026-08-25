// app/src/services/interfaces/snack.service.interface.ts

import { CartItem } from '../../models/cart-item.model';
import { AddToCartDto, UpdateCartItemDto } from '../../dto/snack-cart.dto';

/**
 * Contrato del Servicio de Confitería.
 *
 * Define los métodos obligatorios que debe implementar el servicio
 * encargado de la gestión de snacks, carrito de compras, promociones
 * e inventario.
 */
export interface ISnackService {
  /**
   * Obtiene todos los productos de confitería con precio efectivo,
   * permitiendo un filtro opcional por categoría.
   */
  getAll(category?: string): Promise<any[]>;

  /**
   * Obtiene la disponibilidad (stock) de todos los productos de confitería.
   * Regla de Negocio RN-049.
   */
  getAvailability(): Promise<any[]>;

  /**
   * Valida el inventario, respeta promociones y añade un producto
   * de confitería al carrito de compras del usuario.
   *
   * Regla de Negocio RN-049: Control estricto de inventario.
   */
  addToCart(dto: AddToCartDto): Promise<CartItem>;

  /**
   * Actualiza la cantidad de un ítem del carrito validando inventario.
   * Regla de Negocio RN-049.
   */
  updateCartItem(userId: number, cartItemId: number, dto: UpdateCartItemDto): Promise<CartItem>;

  /**
   * Elimina un ítem del carrito de compras.
   */
  removeCartItem(userId: number, cartItemId: number): Promise<void>;

  /**
   * Obtiene el carrito del usuario con sus ítems y el valor total
   * (respetando promociones y descuentos).
   */
  getCart(userId: number): Promise<any>;
}
