// app/src/__tests__/cart.controller.test.ts

import { Request, Response } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { ICartService } from '../services/interfaces/cart.service.interface.js';
import { CartDetailResponseDto } from '../dto/response/cart-detail.dto.js';

describe('CartController (HU-011)', () => {
  let cartService: jest.Mocked<ICartService>;
  let controller: CartController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    cartService = {
      create: jest.fn(),
      getDetail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      applyMembership: jest.fn(),
      applyGiftcard: jest.fn(),
      expireStaleCart: jest.fn(),
      expireCarts: jest.fn(),
    };

    controller = new CartController(cartService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('create', () => {
    it('debe responder 400 si functionId o seatIds son inválidos', async () => {
      req = {
        userId: 1,
        body: { functionId: null, seatIds: [] },
      };

      await controller.create(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'VALIDATION_ERROR' }));
    });

    it('debe responder 201 con el carrito creado cuando los datos son válidos', async () => {
      req = {
        userId: 1,
        body: { functionId: '5', seatIds: ['10', '11'] },
      };

      const mockCartDetail = {
        cartId: 99,
        status: 'ACTIVE',
        tickets: [],
        snacks: [],
        summary: { total: 50000 },
      } as unknown as CartDetailResponseDto;

      cartService.create.mockResolvedValue(mockCartDetail);

      await controller.create(req as Request, res as Response, next);

      expect(cartService.create).toHaveBeenCalledWith(1, {
        functionId: 5,
        seatIds: [10, 11],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCartDetail);
    });
  });

  describe('getDetail', () => {
    it('debe responder 200 con el detalle del carrito', async () => {
      req = { userId: 2 };
      const mockDetail = { cartId: 15, status: 'ACTIVE' } as unknown as CartDetailResponseDto;
      cartService.getDetail.mockResolvedValue(mockDetail);

      await controller.getDetail(req as Request, res as Response, next);

      expect(cartService.getDetail).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDetail);
    });
  });

  describe('remove', () => {
    it('debe responder 200 con el id del carrito cancelado', async () => {
      req = { userId: 4 };
      cartService.remove.mockResolvedValue({ cartId: 88 });

      await controller.remove(req as Request, res as Response, next);

      expect(cartService.remove).toHaveBeenCalledWith(4);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ cartId: 88 });
    });
  });

  describe('applyGiftcard', () => {
    it('debe invocar cartService.applyGiftcard y responder 200', async () => {
      req = {
        userId: 3,
        body: { amount: 10000 },
      };
      cartService.applyGiftcard.mockResolvedValue({
        appliedAmount: 10000,
        walletBalance: 25000,
      });

      await controller.applyGiftcard(req as Request, res as Response, next);

      expect(cartService.applyGiftcard).toHaveBeenCalledWith(3, { amount: 10000 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ appliedAmount: 10000, walletBalance: 25000 });
    });
  });
});
