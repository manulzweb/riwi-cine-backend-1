/**
 * DTO de entrada para aplicar bonos (giftcards) al carrito.
 *
 * @property {number} amount - Monto de bono a aplicar. Debe ser mayor a cero
 * y no puede superar el saldo disponible del wallet del usuario.
 *
 * @example
 * const dto: ApplyGiftcardRequestDto = { amount: 15000 };
 */
export interface ApplyGiftcardRequestDto {
  amount: number;
}
