// app/src/__tests__/services/cart.service.test.ts

import cartService from '../../services/cart.service';
import cartRepository, { snackRepository } from '../../repositories/cart.repository';
import bonusWalletRepository from '../../repositories/bonus-wallet.repository';
import reservationService from '../../services/reservation.service';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb) => cb({})),
  },
}));

jest.mock('../../repositories/cart.repository', () => ({
  __esModule: true,
  default: {
    findActiveByUserId: jest.fn(),
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
    findActiveMembershipDiscountByUserId: jest.fn().mockResolvedValue(0),
  },
  snackRepository: {
    findById: jest.fn(),
    findActivePromotionsBySnackId: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../repositories/bonus-wallet.repository', () => ({
  __esModule: true,
  default: {
    findByUserId: jest.fn(),
    decrementBalance: jest.fn(),
  },
}));

jest.mock('../../services/reservation.service', () => ({
  __esModule: true,
  default: {
    lockSeats: jest.fn(),
    releaseSeats: jest.fn(),
  },
}));

const mockedCartRepository = jest.mocked(cartRepository);
const mockedSnackRepository = jest.mocked(snackRepository);
const mockedBonusWalletRepository = jest.mocked(bonusWalletRepository);
const mockedReservationService = jest.mocked(reservationService);

const futureExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

const buildActiveCart = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  userId: 10,
  status: 'ACTIVE',
  expiresAt: futureExpiry(),
  giftcardAmount: 0,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CartService · HU-011 Administración del Carrito', () => {
  describe('create', () => {
    it('rechaza crear un segundo carrito activo (RN-044)', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);

      await expect(cartService.create(10, { functionId: 1, seatIds: [5] })).rejects.toThrow(
        'Ya existe un carrito activo para este usuario.',
      );

      expect(mockedReservationService.lockSeats).not.toHaveBeenCalled();
    });

    it('bloquea las sillas, crea el carrito y su entrada', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(null);
      mockedReservationService.lockSeats.mockResolvedValue({
        reservationId: 99,
        seats: [
          { seatId: 5, price: 15000 },
          { seatId: 6, price: 15000 },
        ],
      } as never);
      mockedCartRepository.create.mockResolvedValue(buildActiveCart() as never);
      mockedCartRepository.findDetailById.mockResolvedValue(
        buildActiveCart({
          tickets: [
            {
              id: 7,
              reservationId: 99,
              cartId: 1,
              functionId: 1,
              quantity: 2,
              unitPrice: 15000,
              discountAmount: 0,
              total: 30000,
            },
          ],
          items: [],
        }) as never,
      );

      const result = await cartService.create(10, { functionId: 1, seatIds: [5, 6] });

      expect(mockedReservationService.lockSeats).toHaveBeenCalledWith({
        userId: 10,
        functionId: 1,
        seatIds: [5, 6],
      });
      expect(mockedCartRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 10, status: 'ACTIVE' }),
        expect.anything(),
      );
      expect(mockedCartRepository.addTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          reservationId: 99,
          quantity: 2,
          unitPrice: 15000,
          total: 30000,
        }),
        expect.anything(),
      );
      expect(result.summary.subtotal).toBe(30000);
    });

    it('aplica el descuento de membresía automáticamente al crear el carrito (RN-047)', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(null);
      mockedReservationService.lockSeats.mockResolvedValue({
        reservationId: 99,
        seats: [{ seatId: 5, price: 15000 }],
      } as never);
      mockedCartRepository.create.mockResolvedValue(buildActiveCart() as never);
      mockedCartRepository.findDetailById.mockResolvedValue(
        buildActiveCart({
          tickets: [
            {
              id: 7,
              reservationId: 99,
              cartId: 1,
              functionId: 1,
              quantity: 1,
              unitPrice: 15000,
              discountAmount: 0,
              total: 15000,
            },
          ],
          items: [],
        }) as never,
      );
      mockedCartRepository.findActiveMembershipDiscountByUserId.mockResolvedValue(10);

      const result = await cartService.create(10, { functionId: 1, seatIds: [5] });

      // El descuento se calcula en el resumen sin invocar apply-membership.
      expect(result.summary.membershipDiscountPercentage).toBe(10);
      expect(result.summary.membershipDiscount).toBe(1500);
    });
  });

  describe('getDetail', () => {
    it('lanza error si no hay carrito activo', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(null);

      await expect(cartService.getDetail(10)).rejects.toThrow(
        'No existe un carrito activo para este usuario.',
      );
    });

    it('calcula el resumen con descuentos, bonos e impuestos (RN-047)', async () => {
      const cart = buildActiveCart({ giftcardAmount: 5000 });
      mockedCartRepository.findActiveByUserId.mockResolvedValue(cart as never);

      // subtotal entradas 30000 + snacks base 20000x2 = 70000
      // promo snack: unitPrice 18000 vs base 20000 -> promociones 4000
      // membresía PREMIUM 10% sobre 66000 -> 6600
      // bono aplicado min(5000, 59400) -> 5000
      // taxable 54400, impuestos 19% -> 10336, total 64736
      mockedCartRepository.findDetailById.mockResolvedValue(
        buildActiveCart({
          giftcardAmount: 5000,
          tickets: [
            {
              id: 7,
              reservationId: 99,
              cartId: 1,
              functionId: 1,
              quantity: 2,
              unitPrice: 15000,
              discountAmount: 0,
              total: 30000,
              function: {
                startTime: new Date('2026-09-01T18:30:00Z'),
                format: '2D',
                room: 'Sala 3',
              },
              reservation: {
                reservationSeats: [
                  { seat: { row: 'C', number: 5 } },
                  { seat: { row: 'C', number: 6 } },
                ],
              },
            },
          ],
          items: [
            {
              id: 8,
              cartId: 1,
              snackId: 3,
              quantity: 2,
              unitPrice: 18000,
              snack: {
                name: 'Crispetas',
                price: 20000,
                imageUrl: 'crispetas.png',
                promotions: [],
              },
            },
          ],
        }) as never,
      );
      mockedCartRepository.findActiveMembershipDiscountByUserId.mockResolvedValue(10);

      const result = await cartService.getDetail(10);

      expect(result.tickets[0]).toEqual(
        expect.objectContaining({
          movieTitle: null,
          format: '2D',
          roomName: 'Sala 3',
          seatNumbers: ['C5', 'C6'],
        }),
      );
      expect(result.summary.promotionsDiscount).toBe(4000);
      expect(result.summary.membershipDiscountPercentage).toBe(10);
      expect(result.summary.membershipDiscount).toBe(6600);
      expect(result.summary.giftcardApplied).toBe(5000);
      expect(result.summary.taxes).toBe(10336);
      expect(result.summary.total).toBe(64736);
    });
  });

  describe('update', () => {
    it('rechaza cantidades negativas', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);

      await expect(
        cartService.update(10, { snacks: [{ snackId: 3, quantity: -1 }] }),
      ).rejects.toThrow('No se permiten cantidades negativas.');
    });

    it('rechaza cantidades que exceden el stock disponible', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);
      mockedSnackRepository.findById.mockResolvedValue({
        id: 3,
        name: 'Crispetas',
        stock: 1,
        price: 20000,
        discountPercentage: 0,
      } as never);

      await expect(
        cartService.update(10, { snacks: [{ snackId: 3, quantity: 5 }] }),
      ).rejects.toThrow('Stock insuficiente');
    });
  });

  describe('remove', () => {
    it('libera las sillas y elimina el carrito', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);
      mockedCartRepository.findDetailById.mockResolvedValue(
        buildActiveCart({
          tickets: [{ id: 7, reservationId: 99, cartId: 1 }],
          items: [],
        }) as never,
      );

      const result = await cartService.remove(10);

      expect(mockedReservationService.releaseSeats).toHaveBeenCalledWith({
        reservationId: 99,
        userId: 10,
      });
      expect(mockedCartRepository.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ cartId: 1 });
    });
  });

  describe('applyGiftcard', () => {
    it('rechaza montos mayores al saldo del wallet', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);
      mockedBonusWalletRepository.findByUserId.mockResolvedValue({
        userId: 10,
        balance: 1000,
      } as never);

      await expect(cartService.applyGiftcard(10, { amount: 5000 })).rejects.toThrow(
        'Saldo de bonos insuficiente',
      );
    });

    it('aplica el bono y devuelve el saldo restante', async () => {
      mockedCartRepository.findActiveByUserId.mockResolvedValue(buildActiveCart() as never);
      mockedBonusWalletRepository.findByUserId.mockResolvedValue({
        userId: 10,
        balance: 20000,
      } as never);

      const result = await cartService.applyGiftcard(10, { amount: 5000 });

      expect(mockedBonusWalletRepository.decrementBalance).toHaveBeenCalledWith(
        10,
        5000,
        expect.anything(),
      );
      expect(mockedCartRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ giftcardAmount: 5000 }),
        expect.anything(),
      );
      expect(result).toEqual({ appliedAmount: 5000, walletBalance: 15000 });
    });
  });

  describe('expireCarts', () => {
    it('expira los carritos vencidos y libera sus sillas (RN-046)', async () => {
      mockedCartRepository.findExpiredActive.mockResolvedValue([buildActiveCart()] as never);
      mockedCartRepository.findDetailById.mockResolvedValue(
        buildActiveCart({
          tickets: [{ id: 7, reservationId: 99, cartId: 1 }],
        }) as never,
      );

      const result = await cartService.expireCarts();

      expect(mockedReservationService.releaseSeats).toHaveBeenCalledWith({
        reservationId: 99,
        userId: 10,
      });
      expect(mockedCartRepository.update).toHaveBeenCalledWith(1, {
        status: 'EXPIRED',
      });
      expect(result).toEqual({ cartsExpired: 1, errors: [] });
    });
  });
});
