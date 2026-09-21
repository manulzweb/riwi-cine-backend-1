// app/src/containers/auth.container.ts

import { AuthController } from '../controllers/auth.controller.js';
import AuthService from '../services/auth.service.js';

import UserRepository from '../repositories/user.repository.js';
import RoleRepository from '../repositories/role.repository.js';
import ProfileRepository from '../repositories/profile.repository.js';
import MembershipRepository from '../repositories/membership.repository.js';
import MembershipLevelRepository from '../repositories/membership-level.repository.js';
import MembershipStatusRepository from '../repositories/membership-status.repository.js';
import BonusWalletRepository from '../repositories/bonus-wallet.repository.js';
import PurchaseHistoryRepository from '../repositories/purchase-history.repository.js';
import NotificationPreferenceRepository from '../repositories/notification-preference.repository.js';
import CityRepository from '../repositories/city.repository.js';
import CinemaRepository from '../repositories/cinema.repository.js';
import EmailVerificationTokenRepository from '../repositories/email-verification-token.repository.js';
import RefreshTokenRepository from '../repositories/refresh-token.repository.js';
import LoginAuditRepository from '../repositories/login-audit.repository.js';
import PasswordResetTokenRepository from '../repositories/password-reset-token.repository.js';

import PasswordService from '../services/password.service.js';
import TokenService from '../services/auth-token.service.js';
import EmailVerificationTokenService from '../services/email-verification-token.service.js';

// 1. Instanciar Repositorios
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const profileRepository = new ProfileRepository();
const membershipRepository = new MembershipRepository();
const membershipLevelRepository = new MembershipLevelRepository();
const membershipStatusRepository = new MembershipStatusRepository();
const bonusWalletRepository = new BonusWalletRepository();
const purchaseHistoryRepository = new PurchaseHistoryRepository();
const notificationPreferenceRepository = new NotificationPreferenceRepository();
const cityRepository = new CityRepository();
const cinemaRepository = new CinemaRepository();
const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const loginAuditRepository = new LoginAuditRepository();
const passwordResetTokenRepository = new PasswordResetTokenRepository();

// 2. Instanciar Servicios Auxiliares
const passwordService = new PasswordService();
const tokenService = new TokenService();
const emailVerificationTokenService = new EmailVerificationTokenService();

// 3. Instanciar Servicio Principal vía DI
const authService = new AuthService(
  userRepository,
  roleRepository,
  profileRepository,
  membershipRepository,
  membershipLevelRepository,
  membershipStatusRepository,
  bonusWalletRepository,
  purchaseHistoryRepository,
  notificationPreferenceRepository,
  cityRepository,
  cinemaRepository,
  emailVerificationTokenRepository,
  refreshTokenRepository,
  loginAuditRepository,
  passwordResetTokenRepository,
  passwordService,
  tokenService,
  emailVerificationTokenService,
);

// 4. Instanciar y Exportar Controlador
export const authController = new AuthController(authService);
