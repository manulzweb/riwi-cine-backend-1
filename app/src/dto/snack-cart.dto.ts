// app/src/dto/snack-cart.dto.ts

/**
 * ============================================================================
 * DTOs — Confitería y Carrito de Compras (HU-012)
 * ============================================================================
 *
 * Define las estructuras de datos para las peticiones y respuestas del catálogo
 * de confitería, cálculo de precios con promociones y administración de ítems
 * en el carrito de compras.
 */

/**
 * DTO para agregar un producto de confitería al carrito.
 */
export interface AddToCartDto {
  /**
   * Identificador del usuario propietario del carrito (opcional si se infiere del JWT).
   */
  userId?: number;

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

/**
 * Promoción activa resumida incluida en la respuesta del catálogo.
 */
export interface SnackActivePromotionDto {
  id: number;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Producto de confitería expuesto en el catálogo con precio efectivo y disponibilidad.
 */
export interface SnackCatalogItemDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
  discountPercentage: number;
  finalPrice: number;
  available: boolean;
  activePromotion?: SnackActivePromotionDto | null;
}

/**
 * Disponibilidad de producto de confitería en tiempo real (RN-049).
 */
export interface SnackAvailabilityDto {
  id: number;
  name: string;
  category: string;
  stock: number;
  available: boolean;
}

/**
 * Detalle de un ítem de confitería dentro del carrito del usuario.
 */
export interface SnackCartItemDetailDto {
  cartItemId: number;
  snackId: number;
  name: string | null;
  imageUrl: string | null;
  category?: string | null;
  quantity: number;
  priceUnit: number;
  subtotal: number;
}

/**
 * Respuesta del carrito de confitería con ítems y total calculado.
 */
export interface SnackCartResponseDto {
  cartId: number | null;
  items: SnackCartItemDetailDto[];
  total: number;
}
