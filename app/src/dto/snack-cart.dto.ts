// app/src/dto/snack-cart.dto.ts

/**
 * DTO - Carrito de Confitería
 * ---------------------------
 * Este DTO define la forma de las peticiones relacionadas con el carrito
 * de compras de confitería (HU-012).
 */

/**
 * DTO para agregar un producto de confitería al carrito.
 */
export interface AddToCartDto {
  /**
   * Identificador del usuario propietario del carrito.
   */
  userId: number;

  /**
   * Identificador del producto de confitería (Snack).
   */
  snackId: number;

  /**
   * Cantidad de unidades deseadas (debe ser mayor a cero).
   */
  quantity: number;
}

/**
 * DTO para actualizar la cantidad de un ítem del carrito.
 */
export interface UpdateCartItemDto {
  /**
   * Nueva cantidad de unidades (debe ser mayor a cero).
   */
  quantity: number;
}