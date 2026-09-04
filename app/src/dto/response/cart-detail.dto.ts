// app/src/dto/response/cart-detail.dto.ts

/**
 * DTO de salida con el detalle completo del carrito de compras (HU-011).
 *
 * Incluye las entradas (con datos de la función y las sillas), los productos
 * de confitería y el resumen económico de la compra.
 */

export interface CartTicketDto {
  ticketId: number;
  reservationId: number;
  movieTitle: string | null;
  functionDate: string | null;
  functionTime: string | null;
  roomName: string | null;
  format: string | null;
  quantity: number;
  seatNumbers: string[];
  unitPrice: number;
  discountAmount: number;
  total: number;
}

export interface CartSnackPromotionDto {
  promotionId: number;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

export interface CartSnackItemDto {
  itemId: number;
  snackId: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  promotions: CartSnackPromotionDto[];
}

export interface CartSummaryDto {
  subtotal: number;
  membershipDiscountPercentage: number;
  membershipDiscount: number;
  promotionsDiscount: number;
  giftcardApplied: number;
  taxes: number;
  taxRate: number;
  total: number;
}

export interface CartDetailResponseDto {
  cartId: number;
  status: string;
  expiresAt: string | null;
  tickets: CartTicketDto[];
  snacks: CartSnackItemDto[];
  summary: CartSummaryDto;
}
