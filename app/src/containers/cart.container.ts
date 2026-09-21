// app/src/containers/cart.container.ts

import { CartController } from '../controllers/cart.controller.js';
import { CartRepository, CartSnackRepository } from '../repositories/cart.repository.js';
import BonusWalletRepository from '../repositories/bonus-wallet.repository.js';
import { reservationService } from './reservation.container.js';
import CartService from '../services/cart.service.js';

const cartRepository = new CartRepository();
const snackRepository = new CartSnackRepository();
const bonusWalletRepository = new BonusWalletRepository();

export const cartService = new CartService(
  cartRepository,
  snackRepository,
  reservationService,
  bonusWalletRepository,
);

export const cartController = new CartController(cartService);
