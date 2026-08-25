// app/src/services/interfaces/cart.service.interface.ts

/**
 * Contrato del servicio de carrito de compras (HU-011).
 *
 * Coordina la creación y administración del carrito temporal que centraliza
 * entradas y productos de confitería antes del pago.
 */
import { CartDetailResponseDto } from '../../dto/response/cart-detail.dto';
import { CreateCartRequestDto } from '../../dto/request/create-cart.dto';
import { UpdateCartRequestDto } from '../../dto/request/update-cart.dto';
import { ApplyGiftcardRequestDto } from '../../dto/request/apply-giftcard.dto';

export interface IMembershipDiscountResult {
  discountPercentage: number;
  discountAmount: number;
}

export interface IGiftcardResult {
  appliedAmount: number;
  walletBalance: number;
}

export interface IExpireCartsResult {
  cartsExpired: number;
  errors: string[];
}

export interface ICartService {
  /**
   * Crea el carrito activo del usuario a partir de la reserva de sillas
   * seleccionadas. RN-044: solo puede existir un carrito activo por usuario.
   */
  create(userId: number, dto: CreateCartRequestDto): Promise<CartDetailResponseDto>;

  /**
   * Obtiene el detalle completo del carrito activo con su resumen de totales.
   * RN-046: valida la expiración perezosa antes de responder.
   */
  getDetail(userId: number): Promise<CartDetailResponseDto>;

  /**
   * Modifica el carrito: ajusta cantidades de confitería y/o quita entradas.
   */
  update(userId: number, dto: UpdateCartRequestDto): Promise<CartDetailResponseDto>;

  /**
   * Cancela el carrito activo y libera las sillas reservadas.
   */
  remove(userId: number): Promise<{ cartId: number }>;

  /**
   * Calcula automáticamente el descuento por membresía. RN-047.
   */
  applyMembership(userId: number): Promise<IMembershipDiscountResult>;

  /**
   * Aplica bonos (giftcards) del wallet del usuario al total del carrito.
   */
  applyGiftcard(userId: number, dto: ApplyGiftcardRequestDto): Promise<IGiftcardResult>;

  /**
   * Expira los carritos vencidos y libera sus sillas. Usado por el job
   * programado y reutilizado en la validación perezosa. RN-046.
   */
  expireStaleCart(cartId: number): Promise<void>;

  expireCarts(): Promise<IExpireCartsResult>;
}
