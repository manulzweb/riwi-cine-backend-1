// app/src/__tests__/snack.service.test.ts

import SnackService from '../services/snack.service.js';
import { ISnackRepository } from '../repositories/interfaces/snack.repository.interface.js';
import { IPromotionRepository } from '../repositories/interfaces/promotion.repository.interface.js';
import { ICartRepository } from '../repositories/interfaces/cart.repository.interface.js';
import { ICartItemRepository } from '../repositories/interfaces/cart-item.repository.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { Snack } from '../models/snack.model.js';
import { Promotion } from '../models/promotion.model.js';
import { Cart } from '../models/cart.model.js';
import { CartItem } from '../models/cart-item.model.js';
import User from '../models/user.model.js';
import {
  SnackNotFoundError,
  SnackOutOfStockError,
  InvalidQuantityError,
  UserNotFoundError,
} from '../errors/snack.errors.js';

describe('SnackService (HU-012)', () => {
  let snackRepo: jest.Mocked<ISnackRepository>;
  let promotionRepo: jest.Mocked<IPromotionRepository>;
  let cartRepo: jest.Mocked<ICartRepository>;
  let cartItemRepo: jest.Mocked<ICartItemRepository>;
  let userRepo: jest.Mocked<IUserRepository>;
  let service: SnackService;

  beforeEach(() => {
    snackRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findAllCategories: jest.fn(),
    };

    promotionRepo = {
      findActiveBySnackId: jest.fn(),
      findAllActive: jest.fn(),
    };

    cartRepo = {
      findActiveByUserId: jest.fn(),
      findOrCreateActiveByUserId: jest.fn(),
      findWithItems: jest.fn(),
      findById: jest.fn(),
      findDetailById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addTicket: jest.fn(),
      findTicketById: jest.fn(),
      removeTicket: jest.fn(),
      findExpiredActive: jest.fn(),
      findItemByCartAndSnack: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      findActiveMembershipDiscountByUserId: jest.fn(),
    };

    cartItemRepo = {
      findById: jest.fn(),
      findByCartAndSnack: jest.fn(),
      findByCartItemIdAndCartId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    userRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      activate: jest.fn(),
      findById: jest.fn(),
      incrementFailedAttempts: jest.fn(),
      resetFailedAttempts: jest.fn(),
      updatePassword: jest.fn(),
    };

    service = new SnackService(snackRepo, promotionRepo, cartRepo, cartItemRepo, userRepo);
  });

  describe('getAll (Catálogo y Promociones)', () => {
    it('debe calcular el precio efectivo con una promoción porcentual activa', async () => {
      const mockSnack = {
        id: 1,
        name: 'Crispeta Grande',
        description: 'Deliciosa',
        price: 20000,
        category: 'Crispetas',
        stock: 50,
        imageUrl: 'http://img.com',
        discountPercentage: 0,
      } as unknown as Snack;

      const mockPromotion = {
        id: 10,
        name: 'Miércoles 20% OFF',
        discountType: 'percent',
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(),
      } as unknown as Promotion;

      snackRepo.findAll.mockResolvedValue([mockSnack]);
      promotionRepo.findActiveBySnackId.mockResolvedValue(mockPromotion);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].finalPrice).toBe(16000); // 20000 * 0.8
      expect(result[0].available).toBe(true);
      expect(result[0].activePromotion?.name).toBe('Miércoles 20% OFF');
    });

    it('debe calcular el precio con descuento base cuando no hay promoción', async () => {
      const mockSnack = {
        id: 2,
        name: 'Gaseosa',
        description: 'Refrescante',
        price: 10000,
        category: 'Bebidas',
        stock: 100,
        imageUrl: null,
        discountPercentage: 10,
      } as unknown as Snack;

      snackRepo.findAll.mockResolvedValue([mockSnack]);
      promotionRepo.findActiveBySnackId.mockResolvedValue(null);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].finalPrice).toBe(9000);
      expect(result[0].activePromotion).toBeNull();
    });
  });

  describe('getAvailability (RN-049)', () => {
    it('debe indicar available = false si el stock es 0', async () => {
      const mockSnacks = [
        { id: 1, name: 'Combo 1', category: 'Combos', stock: 10 } as unknown as Snack,
        { id: 2, name: 'Perro Especial', category: 'Comida', stock: 0 } as unknown as Snack,
      ];

      snackRepo.findAll.mockResolvedValue(mockSnacks);

      const result = await service.getAvailability();

      expect(result).toEqual([
        { id: 1, name: 'Combo 1', category: 'Combos', stock: 10, available: true },
        { id: 2, name: 'Perro Especial', category: 'Comida', stock: 0, available: false },
      ]);
    });
  });

  describe('addToCart (RN-049)', () => {
    it('debe rechazar cantidad menor o igual a cero', async () => {
      await expect(service.addToCart({ userId: 1, snackId: 1, quantity: 0 })).rejects.toThrow(
        InvalidQuantityError,
      );
    });

    it('debe rechazar si el usuario no existe', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.addToCart({ userId: 99, snackId: 1, quantity: 2 })).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('debe rechazar si el producto no existe', async () => {
      userRepo.findById.mockResolvedValue({ id: 1 } as unknown as User);
      snackRepo.findById.mockResolvedValue(null);

      await expect(service.addToCart({ userId: 1, snackId: 99, quantity: 2 })).rejects.toThrow(
        SnackNotFoundError,
      );
    });

    it('debe rechazar si el producto está agotado o el stock es insuficiente (RN-049)', async () => {
      userRepo.findById.mockResolvedValue({ id: 1 } as unknown as User);
      snackRepo.findById.mockResolvedValue({
        id: 1,
        name: 'Perro Caliente',
        price: 15000,
        stock: 2,
        discountPercentage: 0,
      } as unknown as Snack);

      cartRepo.findOrCreateActiveByUserId.mockResolvedValue({ id: 10 } as unknown as Cart);
      cartItemRepo.findByCartAndSnack.mockResolvedValue(null);

      await expect(service.addToCart({ userId: 1, snackId: 1, quantity: 5 })).rejects.toThrow(
        SnackOutOfStockError,
      );
    });

    it('debe añadir el producto al carrito exitosamente cuando hay stock', async () => {
      userRepo.findById.mockResolvedValue({ id: 1 } as unknown as User);
      snackRepo.findById.mockResolvedValue({
        id: 1,
        name: 'Crispeta Salada',
        price: 15000,
        stock: 20,
        discountPercentage: 0,
      } as unknown as Snack);

      cartRepo.findOrCreateActiveByUserId.mockResolvedValue({ id: 10 } as unknown as Cart);
      cartItemRepo.findByCartAndSnack.mockResolvedValue(null);
      promotionRepo.findActiveBySnackId.mockResolvedValue(null);

      const createdItem = {
        id: 101,
        cartId: 10,
        snackId: 1,
        quantity: 2,
        unitPrice: 15000,
      } as unknown as CartItem;

      cartItemRepo.create.mockResolvedValue(createdItem);

      const result = await service.addToCart({ userId: 1, snackId: 1, quantity: 2 });

      expect(result).toBe(createdItem);
      expect(cartItemRepo.create).toHaveBeenCalledWith({
        cartId: 10,
        snackId: 1,
        quantity: 2,
        unitPrice: 15000,
      });
      expect(cartRepo.update).toHaveBeenCalled();
    });
  });
});
