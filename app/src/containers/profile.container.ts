// app/src/containers/profile.container.ts

import { ProfileController } from '../controllers/profile.controller.js';
import ProfileService from '../services/profile.service.js';
import UserRepository from '../repositories/user.repository.js';
import ProfileRepository from '../repositories/profile.repository.js';
import MembershipRepository from '../repositories/membership.repository.js';
import NotificationPreferenceRepository from '../repositories/notification-preference.repository.js';
import BonusWalletRepository from '../repositories/bonus-wallet.repository.js';
import CityRepository from '../repositories/city.repository.js';
import CinemaRepository from '../repositories/cinema.repository.js';

// 1. Instanciar Repositorios
const userRepository = new UserRepository();
const profileRepository = new ProfileRepository();
const membershipRepository = new MembershipRepository();
const notificationPreferenceRepository = new NotificationPreferenceRepository();
const bonusWalletRepository = new BonusWalletRepository();
const cityRepository = new CityRepository();
const cinemaRepository = new CinemaRepository();

// 2. Instanciar Servicio vía DI
const profileService = new ProfileService(
  userRepository,
  profileRepository,
  membershipRepository,
  notificationPreferenceRepository,
  bonusWalletRepository,
  cityRepository,
  cinemaRepository,
);

// 3. Exportar Controlador instanciado
export const profileController = new ProfileController(profileService);
