// app/src/services/snack.service.ts

import { Snack } from '../models/snack.model.js';
import { CartItem } from '../models/cart-item.model.js';
import { ISnackService } from './interfaces/snack.service.interface.js';
import { ISnackRepository } from '../repositories/interfaces/snack.repository.interface.js';
import { IPromotionRepository } from '../repositories/interfaces/promotion.repository.interface.js';
import { ICartRepository } from '../repositories/interfaces/cart.repository.interface.js';
import { ICartItemRepository } from '../repositories/interfaces/cart-item.repository.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SnackCatalogItemDto,
  SnackAvailabilityDto,
  SnackCartResponseDto,
  SnackActivePromotionDto,
} from '../dto/snack-cart.dto.js';
import {
  SnackNotFoundError,
  SnackOutOfStockError,
  InvalidQuantityError,
  CartItemNotFoundError,
  UserNotFoundError,
  UserCartNotFoundError,
  UserIdRequiredError,
} from '../errors/snack.errors.js';

/**
 * ============================================================================
 * Servicio de Confitería y Promociones (HU-012)
 * ============================================================================
 *
 * Encargado de gestionar los procesos de confitería, catálogo digital,
 * cálculo dinámico de precios efectivos con promociones vigentes,
 * disponibilidad de inventario (RN-049) y administración de confitería
 * en el carrito de compras.
 *
 * Responsabilidades:
 * - Consultar el catálogo de productos de confitería con precios efectivos.
 * - Consultar las categorías disponibles de confitería.
 * - Consultar la disponibilidad de inventario en tiempo real.
 * - Gestionar los productos de confitería en el carrito (agregar, actualizar, eliminar).
 * - Calcular precios efectivos aplicando promociones vigentes o descuentos base.
 * - Validar estrictamente la disponibilidad de inventario antes de permitir operaciones
 *   sobre el carrito (Regla de Negocio RN-049).
 *
 * El Service no realiza consultas directas mediante Sequelize. Toda persistencia
 * es delegada a sus respectivos repositorios inyectados vía Dependency Injection.
 *
 * @class SnackService
 * @implements {ISnackService}
 * @business
 * - RN-049: No vender productos agotados. Se valida stock disponible antes de agregar
 *   o actualizar ítems en el carrito.
 * - RN-050: Las promociones son configurables y se aplican priorizando la promoción
 *   vigente más favorable para el usuario.
 * - RN-051: Los descuentos aplican a confitería según configuración y nivel de membresía.
 * - RN-052: El inventario se descuenta únicamente después del pago exitoso (HU-013).
 */
class SnackService implements ISnackService {
  constructor(
    private readonly snackRepository: ISnackRepository,
    private readonly promotionRepository: IPromotionRepository,
    private readonly cartRepository: ICartRepository,
    private readonly cartItemRepository: ICartItemRepository,
    private readonly userRepository: IUserRepository,
  ) {
    this.snackRepository = snackRepository;
    this.promotionRepository = promotionRepository;
    this.cartRepository = cartRepository;
    this.cartItemRepository = cartItemRepository;
    this.userRepository = userRepository;
  }

  /**
   * Consulta el catálogo de productos de confitería.
   *
   * Cada producto incluye el precio efectivo (`finalPrice`) calculado
   * a partir de la promoción activa vigente o del descuento base del producto.
   */
  async getAll(category?: string): Promise<SnackCatalogItemDto[]> {
    const snacks = await this.snackRepository.findAll(category);

    return await Promise.all(
      snacks.map(async (snack) => {
        const pricing = await this.calculatePricing(snack);

        return {
          id: snack.id,
          name: snack.name,
          description: snack.description,
          price: Number(snack.price),
          category: snack.category,
          stock: snack.stock,
          imageUrl: snack.imageUrl,
          discountPercentage: Number(snack.discountPercentage),
          finalPrice: pricing.finalPrice,
          available: snack.stock > 0,
          activePromotion: pricing.activePromotion,
        };
      }),
    );
  }

  /**
   * Obtiene la lista de categorías existentes de confitería.
   */
  async getCategories(): Promise<string[]> {
    const categories = await this.snackRepository.findAllCategories();
    if (categories.length > 0) {
      return categories;
    }

    return ['Combos', 'Crispetas', 'Bebidas', 'Comidas Rápidas', 'Dulces', 'Chocolates', 'Nachos'];
  }

  /**
   * Consulta un producto de confitería por su identificador con precio efectivo.
   */
  async getById(id: number): Promise<SnackCatalogItemDto> {
    const snack = await this.snackRepository.findById(id);
    if (!snack) {
      throw new SnackNotFoundError();
    }

    const pricing = await this.calculatePricing(snack);

    return {
      id: snack.id,
      name: snack.name,
      description: snack.description,
      price: Number(snack.price),
      category: snack.category,
      stock: snack.stock,
      imageUrl: snack.imageUrl,
      discountPercentage: Number(snack.discountPercentage),
      finalPrice: pricing.finalPrice,
      available: snack.stock > 0,
      activePromotion: pricing.activePromotion,
    };
  }

  /**
   * Obtiene la disponibilidad e inventario en tiempo real de todos los productos (RN-049).
   */
  async getAvailability(): Promise<SnackAvailabilityDto[]> {
    const snacks = await this.snackRepository.findAll();

    return snacks.map((snack) => ({
      id: snack.id,
      name: snack.name,
      category: snack.category,
      stock: snack.stock,
      available: snack.stock > 0,
    }));
  }

  /**
   * Valida el inventario (RN-049), respeta promociones (RN-050) y añade un producto
   * de confitería al carrito activo del usuario.
   */
  async addToCart(dto: AddToCartDto): Promise<CartItem> {
    const { userId, snackId, quantity } = dto;

    if (!userId) {
      throw new UserIdRequiredError();
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidQuantityError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const snack = await this.snackRepository.findById(snackId);
    if (!snack) {
      throw new SnackNotFoundError();
    }

    // Obtener o crear el carrito activo del usuario
    const cart = await this.cartRepository.findOrCreateActiveByUserId(userId);

    // Verificar si el producto ya existe en el carrito
    const existingItem = await this.cartItemRepository.findByCartAndSnack(cart.id, snackId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    // Validar disponibilidad de inventario (RN-049)
    if (snack.stock === 0 || snack.stock < totalRequested) {
      throw new SnackOutOfStockError(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`,
      );
    }

    // Calcular precio efectivo snapshot
    const pricing = await this.calculatePricing(snack);
    const unitPrice = pricing.finalPrice;

    // Actualizar ítem existente o crear uno nuevo
    if (existingItem) {
      await this.cartItemRepository.update(existingItem.id, {
        quantity: totalRequested,
        unitPrice,
      });
      existingItem.quantity = totalRequested;
      existingItem.unitPrice = unitPrice;

      // Renovar expiración del carrito (10 min de inactividad)
      await this.cartRepository.update(cart.id, {
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      return existingItem;
    }

    const newItem = await this.cartItemRepository.create({
      cartId: cart.id,
      snackId,
      quantity,
      unitPrice,
    });

    await this.cartRepository.update(cart.id, {
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return newItem;
  }

  /**
   * Actualiza la cantidad de un ítem del carrito validando inventario (RN-049).
   */
  async updateCartItem(
    userId: number,
    cartItemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { quantity } = dto;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidQuantityError();
    }

    const cart = await this.cartRepository.findActiveByUserId(userId);
    if (!cart) {
      throw new UserCartNotFoundError();
    }

    const cartItem = await this.cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.id);
    if (!cartItem) {
      throw new CartItemNotFoundError();
    }

    const snack = await this.snackRepository.findById(cartItem.snackId);
    if (!snack) {
      throw new SnackNotFoundError();
    }

    // Validar disponibilidad de inventario (RN-049)
    if (snack.stock === 0 || snack.stock < quantity) {
      throw new SnackOutOfStockError(
        `Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`,
      );
    }

    const pricing = await this.calculatePricing(snack);
    const unitPrice = pricing.finalPrice;

    await this.cartItemRepository.update(cartItem.id, {
      quantity,
      unitPrice,
    });

    cartItem.quantity = quantity;
    cartItem.unitPrice = unitPrice;

    await this.cartRepository.update(cart.id, {
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return cartItem;
  }

  /**
   * Elimina un producto de confitería del carrito de compras.
   */
  async removeCartItem(userId: number, cartItemId: number): Promise<void> {
    const cart = await this.cartRepository.findActiveByUserId(userId);
    if (!cart) {
      throw new UserCartNotFoundError();
    }

    const cartItem = await this.cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.id);
    if (!cartItem) {
      throw new CartItemNotFoundError();
    }

    await this.cartItemRepository.destroy(cartItem);

    await this.cartRepository.update(cart.id, {
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  }

  /**
   * Obtiene el carrito del usuario con sus ítems de confitería y el total calculado.
   */
  async getCart(userId: number): Promise<SnackCartResponseDto> {
    const cart = await this.cartRepository.findWithItems(userId);

    if (!cart) {
      return { cartId: null, items: [], total: 0 };
    }

    const cartItems = cart.items ?? [];

    const items = cartItems.map((item) => {
      const priceUnit = Number(item.unitPrice);
      const subtotal = Math.round(priceUnit * item.quantity * 100) / 100;

      return {
        cartItemId: item.id,
        snackId: item.snackId,
        name: item.snack?.name ?? null,
        imageUrl: item.snack?.imageUrl ?? null,
        category: item.snack?.category ?? null,
        quantity: item.quantity,
        priceUnit,
        subtotal,
      };
    });

    const total = Math.round(items.reduce((acc, item) => acc + item.subtotal, 0) * 100) / 100;

    return { cartId: cart.id, items, total };
  }

  /**
   * Calcula el precio efectivo de un producto aplicando promociones vigentes
   * o descuentos base del producto.
   */
  private async calculatePricing(snack: Snack): Promise<{
    finalPrice: number;
    activePromotion: SnackActivePromotionDto | null;
  }> {
    const activePromotion = await this.promotionRepository.findActiveBySnackId(snack.id);
    const basePrice = Number(snack.price);

    if (activePromotion) {
      const discountVal = Number(activePromotion.discountValue);
      let calculatedPrice: number;

      if (activePromotion.discountType === 'percent') {
        calculatedPrice = Math.round(basePrice * (1 - discountVal / 100) * 100) / 100;
      } else {
        calculatedPrice = Math.max(0, Math.round((basePrice - discountVal) * 100) / 100);
      }

      return {
        finalPrice: calculatedPrice,
        activePromotion: {
          id: activePromotion.id,
          name: activePromotion.name,
          discountType: activePromotion.discountType,
          discountValue: discountVal,
          startDate: activePromotion.startDate,
          endDate: activePromotion.endDate,
        },
      };
    }

    const discountPercentage = Number(snack.discountPercentage);
    if (discountPercentage > 0) {
      const calculatedPrice = Math.round(basePrice * (1 - discountPercentage / 100) * 100) / 100;
      return {
        finalPrice: calculatedPrice,
        activePromotion: null,
      };
    }

    return {
      finalPrice: basePrice,
      activePromotion: null,
    };
  }
}

export default SnackService;
