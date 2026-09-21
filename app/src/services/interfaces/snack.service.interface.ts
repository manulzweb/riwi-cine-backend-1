// app/src/services/interfaces/snack.service.interface.ts

import { CartItem } from '../../models/cart-item.model.js';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SnackCatalogItemDto,
  SnackAvailabilityDto,
  SnackCartResponseDto,
} from '../../dto/snack-cart.dto.js';

/**
 * Contrato del Servicio de Confitería y Promociones (HU-012).
 *
 * Define las operaciones de negocio para la consulta de catálogo,
 * cálculo dinámico de precios efectivos con promociones vigentes,
 * disponibilidad de inventario (RN-049) y administración de confitería
 * en el carrito de compras.
 */
export interface ISnackService {
  /**
   * Consulta el catálogo de productos de confitería con precios efectivos
   * calculados según promociones y descuentos aplicables.
   * Filtro opcional por categoría.
   */
  getAll(category?: string): Promise<SnackCatalogItemDto[]>;

  /**
   * Obtiene la lista de categorías existentes de confitería.
   */
  getCategories(): Promise<string[]>;

  /**
   * Consulta un producto de confitería por su identificador con precio efectivo.
   */
  getById(id: number): Promise<SnackCatalogItemDto>;

  /**
   * Obtiene la disponibilidad e inventario en tiempo real de todos los productos (RN-049).
   */
  getAvailability(): Promise<SnackAvailabilityDto[]>;

  /**
   * Valida inventario (RN-049), respeta promociones (RN-050) y agrega un producto
   * de confitería al carrito activo del usuario.
   */
  addToCart(dto: AddToCartDto): Promise<CartItem>;

  /**
   * Actualiza la cantidad de un ítem de confitería en el carrito validando inventario (RN-049).
   */
  updateCartItem(userId: number, cartItemId: number, dto: UpdateCartItemDto): Promise<CartItem>;

  /**
   * Elimina un producto de confitería del carrito activo del usuario.
   */
  removeCartItem(userId: number, cartItemId: number): Promise<void>;

  /**
   * Obtiene los ítems de confitería del carrito activo del usuario con subtotales y total.
   */
  getCart(userId: number): Promise<SnackCartResponseDto>;
}
