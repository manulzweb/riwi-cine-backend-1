// app/src/__tests__/cart.service.test.ts

import { CartService } from '../services/cart.service.js';
import {
  ICartRepository,
  ICartSnackRepository,
} from '../repositories/interfaces/cart.repository.interface.js';
import { IReservationService } from '../services/interfaces/reservation.service.interface.js';
import { IBonusWalletRepository } from '../repositories/interfaces/bonus-wallet.repository.interface.js';
import {
  CartNotFoundError,
  InvalidAmountError,
  InsufficientBalanceError,
  WalletNotFoundError,
} from '../errors/cart.errors.js';
import Cart from '../models/cart.model.js';
import BonusWallet from '../models/bonus-wallet.model.js';

jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(async (callback: (t: unknown) => unknown) => await callback({})),
  },
}));

describe('CartService (HU-011)', () => {
  let cartRepo: jest.Mocked<ICartRepository>;
  let snackRepo: jest.Mocked<ICartSnackRepository>;
  let reservationService: jest.Mocked<IReservationService>;
  let bonusWalletRepo: jest.Mocked<IBonusWalletRepository>;
  let service: CartService;

  beforeEach(() => {
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

    snackRepo = {
      findById: jest.fn(),
      findActivePromotionsBySnackId: jest.fn(),
    };

    reservationService = {
      getFunctionSeats: jest.fn(),
      lockSeats: jest.fn(),
      releaseSeats: jest.fn(),
      getReservationSummary: jest.fn(),
    };

    bonusWalletRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      decrementBalance: jest.fn(),
      incrementBalance: jest.fn(),
    };

    service = new CartService(cartRepo, snackRepo, reservationService, bonusWalletRepo);
  });

  describe('expireStaleCart (Reembolso de bonos y liberación)', () => {
    it('debe reembolsar el saldo de bonos al wallet si el carrito tenía giftcardAmount aplicado', async () => {
      const mockCart = {
        id: 10,
        userId: 5,
        status: 'ACTIVE',
        giftcardAmount: 15000,
        tickets: [{ reservationId: 101 }],
      } as unknown as Cart;

      cartRepo.findDetailById.mockResolvedValue(mockCart);
      bonusWalletRepo.incrementBalance.mockResolvedValue();
      cartRepo.update.mockResolvedValue();
      reservationService.releaseSeats.mockResolvedValue();

      await service.expireStaleCart(10);

      expect(bonusWalletRepo.incrementBalance).toHaveBeenCalledWith(5, 15000);
      expect(cartRepo.update).toHaveBeenCalledWith(10, { giftcardAmount: 0 });
      expect(reservationService.releaseSeats).toHaveBeenCalledWith({
        reservationId: 101,
        userId: 5,
      });
      expect(cartRepo.update).toHaveBeenCalledWith(10, { status: 'EXPIRED' });
    });

    it('no debe intentar reembolsar si el carrito no tenía bonos aplicados', async () => {
      const mockCart = {
        id: 11,
        userId: 5,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [],
      } as unknown as Cart;

      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.update.mockResolvedValue();

      await service.expireStaleCart(11);

      expect(bonusWalletRepo.incrementBalance).not.toHaveBeenCalled();
      expect(cartRepo.update).toHaveBeenCalledWith(11, { status: 'EXPIRED' });
    });
  });

  describe('remove (Cancelación voluntaria)', () => {
    it('debe reembolsar bonos y liberar sillas al cancelar el carrito', async () => {
      const mockCart = { id: 20, userId: 3 } as Cart;
      const mockDetail = {
        id: 20,
        userId: 3,
        giftcardAmount: 8000,
        tickets: [{ reservationId: 201 }],
      } as unknown as Cart;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockDetail);
      bonusWalletRepo.incrementBalance.mockResolvedValue();
      reservationService.releaseSeats.mockResolvedValue();
      cartRepo.remove.mockResolvedValue();

      const result = await service.remove(3);

      expect(result).toEqual({ cartId: 20 });
      expect(bonusWalletRepo.incrementBalance).toHaveBeenCalledWith(3, 8000);
      expect(reservationService.releaseSeats).toHaveBeenCalledWith({
        reservationId: 201,
        userId: 3,
      });
      expect(cartRepo.remove).toHaveBeenCalledWith(20);
    });

    it('lanza CartNotFoundError si el usuario no tiene carrito activo', async () => {
      cartRepo.findActiveByUserId.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(CartNotFoundError);
    });
  });

  describe('applyGiftcard (Validación de monto y saldo)', () => {
    it('lanza InvalidAmountError si el monto es <= 0 o inválido', async () => {
      await expect(service.applyGiftcard(1, { amount: 0 })).rejects.toThrow(InvalidAmountError);
      await expect(service.applyGiftcard(1, { amount: -500 })).rejects.toThrow(InvalidAmountError);
      await expect(service.applyGiftcard(1, { amount: NaN })).rejects.toThrow(InvalidAmountError);
    });

    it('lanza InvalidAmountError si el monto supera el total a pagar del carrito', async () => {
      const mockCart = {
        id: 30,
        userId: 2,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [{ total: 10000, quantity: 1 }],
        items: [],
      } as unknown as Cart;
      const mockWallet = { userId: 2, balance: 50000 } as BonusWallet;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId.mockResolvedValue(mockWallet);

      await expect(service.applyGiftcard(2, { amount: 20000 })).rejects.toThrow(InvalidAmountError);
    });

    it('lanza InsufficientBalanceError si el usuario no cuenta con saldo suficiente', async () => {
      const mockCart = {
        id: 30,
        userId: 2,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [{ total: 10000, quantity: 1 }],
        items: [],
      } as unknown as Cart;
      const mockWallet = { userId: 2, balance: 2000 } as BonusWallet;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId.mockResolvedValue(mockWallet);

      await expect(service.applyGiftcard(2, { amount: 5000 })).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it('aplica el bono con bloqueo pesimista cuando el saldo y monto son válidos', async () => {
      const mockCart = {
        id: 30,
        userId: 2,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [{ total: 10000, quantity: 1 }],
        items: [],
      } as unknown as Cart;
      const mockWallet = { userId: 2, balance: 10000 } as BonusWallet;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId.mockResolvedValue(mockWallet);
      bonusWalletRepo.decrementBalance.mockResolvedValue();
      cartRepo.update.mockResolvedValue();

      const result = await service.applyGiftcard(2, { amount: 5000 });

      expect(result).toEqual({ appliedAmount: 5000, walletBalance: 5000 });
      expect(bonusWalletRepo.findByUserId).toHaveBeenCalledWith(2, expect.anything(), true);
      expect(bonusWalletRepo.decrementBalance).toHaveBeenCalledWith(2, 5000, expect.anything());
    });

    it('lanza WalletNotFoundError si el usuario no tiene una billetera de bonos registrada', async () => {
      const mockCart = {
        id: 31,
        userId: 9,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [{ total: 10000, quantity: 1 }],
        items: [],
      } as unknown as Cart;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId.mockResolvedValue(null);

      await expect(service.applyGiftcard(9, { amount: 5000 })).rejects.toThrow(WalletNotFoundError);
    });

    it('permite aplicar el monto exacto equivalente al saldo disponible (límite superior de saldo)', async () => {
      const mockCart = {
        id: 32,
        userId: 4,
        status: 'ACTIVE',
        giftcardAmount: 0,
        tickets: [{ total: 15000, quantity: 1 }],
        items: [],
      } as unknown as Cart;
      const mockWallet = { userId: 4, balance: 10000 } as BonusWallet;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId.mockResolvedValue(mockWallet);
      bonusWalletRepo.decrementBalance.mockResolvedValue();
      cartRepo.update.mockResolvedValue();

      const result = await service.applyGiftcard(4, { amount: 10000 });

      expect(result).toEqual({ appliedAmount: 10000, walletBalance: 0 });
      expect(bonusWalletRepo.decrementBalance).toHaveBeenCalledWith(4, 10000, expect.anything());
    });

    it('restituye el saldo previamente aplicado antes de validar y aplicar el nuevo monto', async () => {
      const mockCart = {
        id: 33,
        userId: 6,
        status: 'ACTIVE',
        giftcardAmount: 3000,
        tickets: [{ total: 20000, quantity: 1 }],
        items: [],
      } as unknown as Cart;
      const initialWallet = { userId: 6, balance: 5000 } as BonusWallet;
      const restoredWallet = { userId: 6, balance: 8000 } as BonusWallet;

      cartRepo.findActiveByUserId.mockResolvedValue(mockCart);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);
      bonusWalletRepo.findByUserId
        .mockResolvedValueOnce(initialWallet)
        .mockResolvedValueOnce(restoredWallet);
      bonusWalletRepo.incrementBalance.mockResolvedValue();
      bonusWalletRepo.decrementBalance.mockResolvedValue();
      cartRepo.update.mockResolvedValue();

      const result = await service.applyGiftcard(6, { amount: 7000 });

      expect(bonusWalletRepo.incrementBalance).toHaveBeenCalledWith(6, 3000, expect.anything());
      expect(bonusWalletRepo.decrementBalance).toHaveBeenCalledWith(6, 7000, expect.anything());
      expect(result).toEqual({ appliedAmount: 7000, walletBalance: 1000 });
    });
  });

  describe('create (Cálculo de precio unitario coherente)', () => {
    it('calcula unitPrice adecuadamente cuando hay sillas con distintos precios', async () => {
      cartRepo.findActiveByUserId.mockResolvedValue(null);
      reservationService.lockSeats.mockResolvedValue({
        reservationId: 50,
        functionId: 1,
        userId: 1,
        totalSeats: 2,
        subtotal: 60000,
        expiresAt: new Date().toISOString(),
        seats: [
          { seatId: 1, row: 'A', number: 1, type: 'VIP', price: 35000 },
          { seatId: 2, row: 'A', number: 2, type: 'General', price: 25000 },
        ],
      });

      const mockCart = {
        id: 77,
        userId: 1,
        status: 'ACTIVE',
        expiresAt: new Date(),
        giftcardAmount: 0,
        tickets: [],
        items: [],
      } as unknown as Cart;

      cartRepo.create.mockResolvedValue(mockCart);
      cartRepo.addTicket.mockResolvedValue({} as never);
      cartRepo.findDetailById.mockResolvedValue(mockCart);
      cartRepo.findActiveMembershipDiscountByUserId.mockResolvedValue(0);

      const result = await service.create(1, { functionId: 1, seatIds: [1, 2] });

      expect(cartRepo.addTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2,
          unitPrice: 30000, // Promedio exacto 60000 / 2
          total: 60000,
        }),
        expect.anything(),
      );
      expect(result.cartId).toBe(77);
    });
  });
});
