// app/src/containers/snack.container.ts

import { SnackController } from '../controllers/snack.controller.js';
import SnackService from '../services/snack.service.js';
import SnackRepository from '../repositories/snack.repository.js';
import PromotionRepository from '../repositories/promotion.repository.js';
import CartItemRepository from '../repositories/cart-item.repository.js';
import { CartRepository } from '../repositories/cart.repository.js';
import UserRepository from '../repositories/user.repository.js';

// 1. Instanciar Repositorios
const snackRepository = new SnackRepository();
const promotionRepository = new PromotionRepository();
const cartItemRepository = new CartItemRepository();
const cartRepository = new CartRepository();
const userRepository = new UserRepository();

// 2. Instanciar Servicio vía Dependency Injection
const snackService = new SnackService(
  snackRepository,
  promotionRepository,
  cartRepository,
  cartItemRepository,
  userRepository,
);

// 3. Exportar Controlador
export const snackController = new SnackController(snackService);
