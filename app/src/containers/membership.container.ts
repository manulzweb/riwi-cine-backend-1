// app/src/containers/membership.container.ts

import { MembershipController } from '../controllers/membership.controller.js';
import MembershipService from '../services/membership.service.js';
import MembershipRepository from '../repositories/membership.repository.js';
import MembershipLevelRepository from '../repositories/membership-level.repository.js';
import MembershipStatusRepository from '../repositories/membership-status.repository.js';
import BonusWalletRepository from '../repositories/bonus-wallet.repository.js';
import UserRepository from '../repositories/user.repository.js';

// 1. Instanciar Repositorios
const membershipRepository = new MembershipRepository();
const membershipLevelRepository = new MembershipLevelRepository();
const membershipStatusRepository = new MembershipStatusRepository();
const bonusWalletRepository = new BonusWalletRepository();
const userRepository = new UserRepository();

// 2. Instanciar Servicio vía DI
const membershipService = new MembershipService(
  membershipRepository,
  membershipLevelRepository,
  membershipStatusRepository,
  bonusWalletRepository,
  userRepository,
);

// 3. Exportar Controlador instanciado
export const membershipController = new MembershipController(membershipService);
