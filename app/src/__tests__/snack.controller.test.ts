// app/src/__tests__/snack.controller.test.ts

import { Request, Response } from 'express';
import { SnackController } from '../controllers/snack.controller.js';
import { ISnackService } from '../services/interfaces/snack.service.interface.js';
import { InvalidSnackIdError, InvalidQuantityError } from '../errors/snack.errors.js';

import { SnackCatalogItemDto } from '../dto/snack-cart.dto.js';
import { CartItem } from '../models/cart-item.model.js';

describe('SnackController (HU-012)', () => {
  let snackService: jest.Mocked<ISnackService>;
  let controller: SnackController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    snackService = {
      getAll: jest.fn(),
      getCategories: jest.fn(),
      getById: jest.fn(),
      getAvailability: jest.fn(),
      addToCart: jest.fn(),
      updateCartItem: jest.fn(),
      removeCartItem: jest.fn(),
      getCart: jest.fn(),
    };

    controller = new SnackController(snackService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getAllSnacks', () => {
    it('debe responder 200 con el catálogo obtenido del servicio', async () => {
      req = { query: { category: 'Combos' } };
      const mockCatalog: SnackCatalogItemDto[] = [
        {
          id: 1,
          name: 'Combo Mega',
          description: 'Combo grande',
          price: 35000,
          category: 'Combos',
          stock: 20,
          imageUrl: null,
          discountPercentage: 0,
          finalPrice: 30000,
          available: true,
        },
      ];
      snackService.getAll.mockResolvedValue(mockCatalog);

      await controller.getAllSnacks(req as Request, res as Response, next);

      expect(snackService.getAll).toHaveBeenCalledWith('Combos');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCatalog);
    });
  });

  describe('getSnackById', () => {
    it('debe propagar InvalidSnackIdError si el ID no es numérico', async () => {
      req = { params: { id: 'abc' } };

      await controller.getSnackById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(InvalidSnackIdError));
    });

    it('debe responder 200 cuando el ID es válido', async () => {
      req = { params: { id: '1' } };
      const mockSnack: SnackCatalogItemDto = {
        id: 1,
        name: 'Crispeta Salada',
        description: 'Crispeta de sal',
        price: 15000,
        category: 'Crispetas',
        stock: 50,
        imageUrl: null,
        discountPercentage: 0,
        finalPrice: 15000,
        available: true,
      };
      snackService.getById.mockResolvedValue(mockSnack);

      await controller.getSnackById(req as Request, res as Response, next);

      expect(snackService.getById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSnack);
    });
  });

  describe('addSnackToCart', () => {
    it('debe propagar InvalidQuantityError si quantity <= 0', async () => {
      req = {
        userId: 1,
        body: { snackId: 2, quantity: 0 },
      };

      await controller.addSnackToCart(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(InvalidQuantityError));
    });

    it('debe responder 201 cuando los datos son válidos', async () => {
      req = {
        userId: 1,
        body: { snackId: 2, quantity: 3 },
      };

      const mockCartItem = { id: 10, cartId: 1, snackId: 2, quantity: 3 } as unknown as CartItem;
      snackService.addToCart.mockResolvedValue(mockCartItem);

      await controller.addSnackToCart(req as Request, res as Response, next);

      expect(snackService.addToCart).toHaveBeenCalledWith({
        userId: 1,
        snackId: 2,
        quantity: 3,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto agregado al carrito con éxito.',
        data: mockCartItem,
      });
    });
  });
});
