// app/src/services/cart.service.ts

import sequelize from '../config/database.js';
import { envConfig } from '../config/env.js';
import {
  ICartRepository,
  ICartSnackRepository,
} from '../repositories/interfaces/cart.repository.interface.js';
import { IBonusWalletRepository } from '../repositories/interfaces/bonus-wallet.repository.interface.js';
import { IReservationService } from './interfaces/reservation.service.interface.js';
import {
  ICartService,
  IExpireCartsResult,
  IGiftcardResult,
  IMembershipDiscountResult,
} from './interfaces/cart.service.interface.js';
import { CartDetailResponseDto } from '../dto/response/cart-detail.dto.js';
import { CreateCartRequestDto } from '../dto/request/create-cart.dto.js';
import { UpdateCartRequestDto } from '../dto/request/update-cart.dto.js';
import { ApplyGiftcardRequestDto } from '../dto/request/apply-giftcard.dto.js';
import {
  CartExpiredError,
  CartNotFoundError,
  DuplicateCartError,
  InsufficientBalanceError,
  InsufficientStockError,
  InvalidAmountError,
  NegativeQuantityError,
  OutOfStockError,
  SnackNotFoundError,
  TicketNotBelongsError,
  WalletNotFoundError,
} from '../errors/cart.errors.js';

/** Resultado mínimo esperado del servicio de reservas al bloquear sillas. */
interface LockSeatsResult {
  reservationId: number;
  seats: Array<{ seatId: number; price: number | string }>;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

interface SnackPricing {
  basePrice: number;
  unitPrice: number;
  promotions: Array<{
    promotionId: number;
    name: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
  }>;
}

/**
 * Servicio encargado de la administración del carrito de compras (HU-011).
 *
 * Responsabilidades:
 * - Crear el carrito temporal a partir de la selección de sillas.
 * - Administrar entradas y productos de confitería.
 * - Calcular subtotal, descuentos, bonos, impuestos y total.
 * - Aplicar reglas de negocio RN-044 a RN-048.
 * - Expirar carritos inactivos liberando las sillas reservadas.
 */
export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly snackRepository: ICartSnackRepository,
    private readonly reservationService: IReservationService,
    private readonly bonusWalletRepository: IBonusWalletRepository,
  ) {
    this.cartRepository = cartRepository;
    this.snackRepository = snackRepository;
    this.reservationService = reservationService;
    this.bonusWalletRepository = bonusWalletRepository;
  }

  private expiryMs(): number {
    return envConfig.CART.EXPIRY_MINUTES * 60 * 1000;
  }

  private newExpiry(): Date {
    return new Date(Date.now() + this.expiryMs());
  }

  /**
   * Calcula el precio unitario efectivo de un snack respetando sus
   * promociones vigentes. RN-048: si la configuración administrativa lo
   * prohíbe (COMBINE_PROMOTIONS=false), las promociones no se combinan y
   * se aplica únicamente la más favorable para el usuario.
   */
  private async effectiveSnackPrice(snackId: number): Promise<SnackPricing> {
    const now = new Date();
    const snack = await this.snackRepository.findById(snackId);

    if (!snack) {
      throw new SnackNotFoundError();
    }

    if (snack.stock <= 0) {
      throw new OutOfStockError(`El producto "${snack.name}" está agotado.`);
    }

    const activePromotions = await this.snackRepository.findActivePromotionsBySnackId(snackId, now);
    const basePrice = Number(snack.price);
    const baseDiscountPercentage = Number(snack.discountPercentage);

    const percentCandidates: number[] = [];
    if (baseDiscountPercentage > 0) {
      percentCandidates.push(baseDiscountPercentage);
    }

    const fixedCandidates: number[] = [];
    for (const promotion of activePromotions) {
      const value = Number(promotion.discountValue);
      if (promotion.discountType === 'percent') {
        percentCandidates.push(value);
      } else {
        fixedCandidates.push(value);
      }
    }

    let unitPrice = basePrice;

    if (envConfig.CART.COMBINE_PROMOTIONS) {
      // Se combinan todos los descuentos vigentes.
      const percentFactor = percentCandidates.reduce((acc, p) => acc * (1 - p / 100), 1);
      const fixedTotal = fixedCandidates.reduce((acc, f) => acc + f, 0);
      unitPrice = basePrice * percentFactor - fixedTotal;
    } else if (percentCandidates.length > 0 || fixedCandidates.length > 0) {
      // Solo se aplica la promoción más favorable (RN-048 por defecto).
      const bestPercent = percentCandidates.length > 0 ? Math.max(...percentCandidates) : 0;
      const priceWithPercent = basePrice * (1 - bestPercent / 100);
      const bestFixed = fixedCandidates.length > 0 ? Math.max(...fixedCandidates) : 0;
      const priceWithFixed = basePrice - bestFixed;
      unitPrice = Math.min(priceWithPercent, priceWithFixed);
    }

    return {
      basePrice,
      unitPrice: round2(Math.max(0, unitPrice)),
      promotions: activePromotions.map((promotion) => ({
        promotionId: promotion.id,
        name: promotion.name,
        discountType: promotion.discountType,
        discountValue: Number(promotion.discountValue),
      })),
    };
  }

  async create(userId: number, dto: CreateCartRequestDto): Promise<CartDetailResponseDto> {
    const existing = await this.cartRepository.findActiveByUserId(userId);

    if (existing) {
      throw new DuplicateCartError();
    }

    let lockResult: LockSeatsResult | null = null;

    try {
      lockResult = (await this.reservationService.lockSeats({
        userId,
        functionId: dto.functionId,
        seatIds: dto.seatIds,
      })) as LockSeatsResult;

      const seats = lockResult.seats ?? [];
      const quantity = seats.length;
      const total = round2(seats.reduce((sum, seat) => sum + Number(seat.price), 0));
      const allSamePrice = seats.every((s) => Number(s.price) === Number(seats[0]?.price));
      const unitPrice =
        quantity > 0 ? (allSamePrice ? Number(seats[0].price) : round2(total / quantity)) : 0;

      const cart = await sequelize.transaction(async (transaction) => {
        const created = await this.cartRepository.create(
          { userId, status: 'ACTIVE', expiresAt: this.newExpiry() },
          transaction,
        );

        await this.cartRepository.addTicket(
          {
            cartId: created.id,
            functionId: dto.functionId,
            reservationId: lockResult!.reservationId,
            quantity,
            unitPrice,
            total,
          },
          transaction,
        );

        return created;
      });

      return await this.buildDetail(userId, cart.id);
    } catch (error) {
      // Si se creó una reserva pero falló la creación del carrito (ej. duplicado por concurrencia),
      // liberar la reserva para no dejar sillas bloqueadas huérfanas.
      if (lockResult) {
        try {
          await this.reservationService.releaseSeats({
            reservationId: lockResult.reservationId,
            userId,
          });
        } catch {
          // Ignorar errores de liberación (ej. ya expiró)
        }
      }

      if (
        error instanceof Error &&
        (error.name === 'SequelizeUniqueConstraintError' ||
          error.message.includes('uniq_active_cart_per_user') ||
          error.message.includes('could not serialize'))
      ) {
        throw new DuplicateCartError();
      }

      throw error;
    }
  }

  /**
   * Marca un carrito como expirado, libera las sillas y reembolsa los bonos aplicados.
   */
  async expireStaleCart(cartId: number): Promise<void> {
    const cart = await this.cartRepository.findDetailById(cartId);

    if (cart?.status !== 'ACTIVE') return;

    // Si se habían aplicado bonos, devolver el saldo a la billetera
    const giftcardAmount = Number(cart.giftcardAmount || 0);
    if (giftcardAmount > 0) {
      try {
        await this.bonusWalletRepository.incrementBalance(cart.userId, giftcardAmount);
        await this.cartRepository.update(cartId, { giftcardAmount: 0 });
      } catch (err) {
        console.error(`Error reembolsando bonos al expirar carrito ${cartId}:`, err);
      }
    }

    for (const ticket of cart.tickets ?? []) {
      try {
        await this.reservationService.releaseSeats({
          reservationId: ticket.reservationId,
          userId: cart.userId,
        });
      } catch {
        // Si la reserva ya expiró por sí misma se continúa con las demás.
      }
    }

    await this.cartRepository.update(cartId, { status: 'EXPIRED' });
  }

  async expireCarts(): Promise<IExpireCartsResult> {
    const expired = await this.cartRepository.findExpiredActive(new Date());
    const errors: string[] = [];
    let cartsExpired = 0;

    for (const cart of expired) {
      try {
        await this.expireStaleCart(cart.id);
        cartsExpired += 1;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `Error expirando carrito ${cart.id}`);
      }
    }

    return { cartsExpired, errors };
  }

  /**
   * Obtiene el carrito activo del usuario validando expiración perezosa
   * (RN-046). Lanza error si no existe o si acaba de vencer.
   */
  private async getActiveCartOrThrow(userId: number) {
    const cart = await this.cartRepository.findActiveByUserId(userId);

    if (!cart) {
      throw new CartNotFoundError();
    }

    if (cart.expiresAt && cart.expiresAt.getTime() <= Date.now()) {
      await this.expireStaleCart(cart.id);
      throw new CartExpiredError();
    }

    return cart;
  }

  /**
   * Construye el detalle completo del carrito con su resumen económico.
   */
  private async buildDetail(userId: number, cartId: number): Promise<CartDetailResponseDto> {
    const cart = await this.cartRepository.findDetailById(cartId);

    if (!cart) {
      throw new CartNotFoundError();
    }

    const tickets = (cart.tickets ?? []).map((ticket) => {
      const cinemaFunction = ticket.function as unknown as
        | {
            startTime?: Date | null;
            dateTime?: Date | null;
            format?: string | null;
            room?: string | null;
          }
        | undefined;
      const movie = (cinemaFunction as unknown as { movie?: { title?: string } } | undefined)
        ?.movie;
      const reservation = ticket.reservation as unknown as
        { reservationSeats?: Array<{ seat?: { row: string; number: number } | null }> } | undefined;
      const seatNumbers = (reservation?.reservationSeats ?? [])
        .map((reservationSeat) =>
          reservationSeat.seat ? `${reservationSeat.seat.row}${reservationSeat.seat.number}` : '',
        )
        .filter(Boolean);
      const startTime = cinemaFunction?.startTime ?? cinemaFunction?.dateTime ?? null;

      return {
        ticketId: ticket.id,
        reservationId: ticket.reservationId,
        movieTitle: movie?.title ?? null,
        functionDate: startTime ? new Date(startTime).toISOString().slice(0, 10) : null,
        functionTime: startTime ? new Date(startTime).toISOString().slice(11, 16) : null,
        roomName: cinemaFunction?.room ?? null,
        format: cinemaFunction?.format ?? null,
        quantity: ticket.quantity,
        seatNumbers,
        unitPrice: Number(ticket.unitPrice),
        discountAmount: Number(ticket.discountAmount),
        total: Number(ticket.total),
      };
    });

    const snacks = (cart.items ?? []).map((item) => {
      const snack = item.snack as unknown as
        | {
            name?: string;
            price?: number | string;
            imageUrl?: string | null;
            promotions?: Array<{
              id: number;
              name: string;
              discountType: 'percent' | 'fixed';
              discountValue: number | string;
            }>;
          }
        | undefined;

      return {
        itemId: item.id,
        snackId: item.snackId,
        name: snack?.name ?? '',
        imageUrl: snack?.imageUrl ?? null,
        quantity: item.quantity,
        basePrice: Number(snack?.price ?? item.unitPrice),
        unitPrice: Number(item.unitPrice),
        promotions: (snack?.promotions ?? []).map((promotion) => ({
          promotionId: promotion.id,
          name: promotion.name,
          discountType: promotion.discountType,
          discountValue: Number(promotion.discountValue),
        })),
      };
    });

    const ticketsSubtotal = round2(tickets.reduce((sum, ticket) => sum + ticket.total, 0));

    let snacksGross = 0;
    let snacksNet = 0;
    for (const item of snacks) {
      snacksGross += item.basePrice * item.quantity;
      snacksNet += item.unitPrice * item.quantity;
    }
    snacksGross = round2(snacksGross);
    snacksNet = round2(snacksNet);

    const promotionsDiscount = round2(Math.max(0, snacksGross - snacksNet));
    const subtotal = round2(ticketsSubtotal + snacksGross);

    const membershipDiscountPercentage =
      await this.cartRepository.findActiveMembershipDiscountByUserId(userId);
    const membershipBase = Math.max(0, subtotal - promotionsDiscount);
    const membershipDiscount = round2(membershipBase * (membershipDiscountPercentage / 100));

    const giftcardApplied = round2(
      Math.min(Number(cart.giftcardAmount), Math.max(0, membershipBase - membershipDiscount)),
    );
    const taxable = round2(
      Math.max(0, subtotal - promotionsDiscount - membershipDiscount - giftcardApplied),
    );
    const taxes = round2(taxable * envConfig.CART.TAX_RATE);
    const total = round2(taxable + taxes);

    return {
      cartId: cart.id,
      status: cart.status,
      expiresAt: cart.expiresAt ? cart.expiresAt.toISOString() : null,
      tickets,
      snacks,
      summary: {
        subtotal,
        membershipDiscountPercentage,
        membershipDiscount,
        promotionsDiscount,
        giftcardApplied,
        taxes,
        taxRate: envConfig.CART.TAX_RATE,
        total,
      },
    };
  }

  async getDetail(userId: number): Promise<CartDetailResponseDto> {
    const cart = await this.getActiveCartOrThrow(userId);

    return await this.buildDetail(userId, cart.id);
  }

  private async applySnackChanges(
    cart: { id: number },
    snacks: Array<{ snackId: number; quantity: number }>,
  ): Promise<void> {
    for (const change of snacks) {
      if (!Number.isInteger(change.quantity) || change.quantity < 0) {
        throw new NegativeQuantityError();
      }
    }

    for (const change of snacks) {
      await this.applySnackChange(cart, change);
    }
  }

  private async applySnackChange(
    cart: { id: number },
    change: { snackId: number; quantity: number },
  ): Promise<void> {
    const existingItem = await this.cartRepository.findItemByCartAndSnack(cart.id, change.snackId);

    if (change.quantity === 0) {
      if (existingItem) {
        await this.cartRepository.removeItem(existingItem.id);
      }
      return;
    }

    const pricing = await this.effectiveSnackPrice(change.snackId);
    const snack = await this.snackRepository.findById(change.snackId);

    if (!snack || snack.stock < change.quantity) {
      throw new InsufficientStockError(
        `Stock insuficiente para "${snack?.name ?? 'el producto'}". Disponible: ${snack?.stock ?? 0}.`,
      );
    }

    if (existingItem) {
      await this.cartRepository.updateItem(existingItem.id, {
        quantity: change.quantity,
        unitPrice: pricing.unitPrice,
      });
      return;
    }

    await this.cartRepository.createItem({
      cartId: cart.id,
      snackId: change.snackId,
      quantity: change.quantity,
      unitPrice: pricing.unitPrice,
    });
  }

  private async removeTickets(
    cart: { id: number; userId: number },
    ticketIds: number[],
  ): Promise<void> {
    for (const ticketId of ticketIds) {
      const ticket = await this.cartRepository.findTicketById(ticketId);

      if (ticket?.cartId !== cart.id) {
        throw new TicketNotBelongsError();
      }

      await this.reservationService.releaseSeats({
        reservationId: ticket.reservationId,
        userId: cart.userId,
      });

      await this.cartRepository.removeTicket(ticketId);
    }
  }

  async update(userId: number, dto: UpdateCartRequestDto): Promise<CartDetailResponseDto> {
    const cart = await this.getActiveCartOrThrow(userId);

    if (dto.snacks?.length) {
      await this.applySnackChanges(cart, dto.snacks);
    }

    if (dto.removeTicketIds?.length) {
      await this.removeTickets(cart, dto.removeTicketIds);
    }

    await this.cartRepository.update(cart.id, { expiresAt: this.newExpiry() });

    return await this.buildDetail(userId, cart.id);
  }

  async remove(userId: number): Promise<{ cartId: number }> {
    const cart = await this.cartRepository.findActiveByUserId(userId);

    if (!cart) {
      throw new CartNotFoundError();
    }

    const detail = await this.cartRepository.findDetailById(cart.id);

    // Reembolsar saldo de bonos al cancelar el carrito
    const giftcardAmount = Number(detail?.giftcardAmount ?? cart.giftcardAmount ?? 0);
    if (giftcardAmount > 0) {
      await this.bonusWalletRepository.incrementBalance(userId, giftcardAmount);
    }

    for (const ticket of detail?.tickets ?? []) {
      try {
        await this.reservationService.releaseSeats({
          reservationId: ticket.reservationId,
          userId,
        });
      } catch {
        // La reserva pudo expirar por sí misma; se continúa con la cancelación.
      }
    }

    await this.cartRepository.remove(cart.id);

    return { cartId: cart.id };
  }

  async applyMembership(userId: number): Promise<IMembershipDiscountResult> {
    const cart = await this.getActiveCartOrThrow(userId);
    const detail = await this.buildDetail(userId, cart.id);

    return {
      discountPercentage: detail.summary.membershipDiscountPercentage,
      discountAmount: detail.summary.membershipDiscount,
    };
  }

  async applyGiftcard(userId: number, dto: ApplyGiftcardRequestDto): Promise<IGiftcardResult> {
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
      throw new InvalidAmountError();
    }

    const cart = await this.getActiveCartOrThrow(userId);
    const detail = await this.buildDetail(userId, cart.id);
    const maxApplicableAmount = round2(detail.summary.total + detail.summary.giftcardApplied);

    if (dto.amount > maxApplicableAmount) {
      throw new InvalidAmountError(
        `El monto del bono (${dto.amount}) no puede superar el total a pagar del carrito (${maxApplicableAmount}).`,
      );
    }

    return await sequelize.transaction(async (transaction) => {
      const wallet = await this.bonusWalletRepository.findByUserId(userId, transaction, true);

      if (!wallet) {
        throw new WalletNotFoundError();
      }

      // Si el carrito ya tenía un bono aplicado previamente, restituir antes de aplicar el nuevo monto
      const currentGiftcard = Number(cart.giftcardAmount || 0);
      if (currentGiftcard > 0) {
        await this.bonusWalletRepository.incrementBalance(userId, currentGiftcard, transaction);
      }

      const updatedWallet = await this.bonusWalletRepository.findByUserId(
        userId,
        transaction,
        true,
      );
      const balance = Number(updatedWallet?.balance ?? 0);

      if (balance < dto.amount) {
        throw new InsufficientBalanceError(
          `Saldo de bonos insuficiente. Saldo disponible: ${balance}.`,
        );
      }

      await this.bonusWalletRepository.decrementBalance(userId, dto.amount, transaction);

      await this.cartRepository.update(
        cart.id,
        {
          giftcardAmount: round2(dto.amount),
          expiresAt: this.newExpiry(),
        },
        transaction,
      );

      return { appliedAmount: round2(dto.amount), walletBalance: round2(balance - dto.amount) };
    });
  }
}

export default CartService;
