// app/src/services/interfaces/snack.service.interface.ts

import { CartItem } from '../../models/cart-item.model';
import { AddToCartDto, UpdateCartItemDto } from '../../dto/snack-cart.dto';

/**
 * Interfaz para el Servicio de Confitería
 * --------------------------------------
 * Este archivo define el contrato y los métodos obligatorios que debe implementar
 * el servicio encargado de la gestión de snacks y confitería.
 */
export interface ISnackService {
  /**
   * Obtiene todos los productos de confitería, permitiendo un filtro opcional por categoría.
   */
  getAll(category?: string): Promise<any[]>;

  /**
   * Obtiene la disponibilidad (stock) de todos los productos de confitería.
   */
  getAvailability(): Promise<any[]>;

  /**
   * Valida el inventario, respeta promociones y añade un producto de confitería
   * al carrito de compras del usuario.
   */
  addToCart(dto: AddToCartDto): Promise<CartItem>;

  /**
   * Actualiza la cantidad de un ítem del carrito validando inventario.
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