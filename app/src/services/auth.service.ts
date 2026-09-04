// app/src/services/auth.service.ts

import crypto from 'node:crypto';
import { Transaction, UniqueConstraintError } from 'sequelize';
import sequelize from '../config/database.js';

import { RegisterUserRequestDto } from '../dto/request/register-user.dto.js';
import { LoginUserRequestDto } from '../dto/request/login-user.dto.js';
import { VerifyEmailRequestDto } from '../dto/request/verify-email.dto.js';
import { ForgotPasswordRequestDto } from '../dto/request/forgot-password.dto.js';
import { ResetPasswordRequestDto } from '../dto/request/reset-password.dto.js';

import {
  IAuthService,
  LoginUserResult,
  RegisterUserResult,
} from './interfaces/auth.service.interface.js';

import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { IRoleRepository } from '../repositories/interfaces/role.repository.interface.js';
import { IProfileRepository } from '../repositories/interfaces/profile.repository.interface.js';
import { IMembershipRepository } from '../repositories/interfaces/membership.repository.interface.js';
import { IMembershipLevelRepository } from '../repositories/interfaces/membership-level.repository.interface.js';
import { IMembershipStatusRepository } from '../repositories/interfaces/membership-status.repository.interface.js';
import { IBonusWalletRepository } from '../repositories/interfaces/bonus-wallet.repository.interface.js';
import { IPurchaseHistoryRepository } from '../repositories/interfaces/purchase-history.repository.interface.js';
import { INotificationPreferenceRepository } from '../repositories/interfaces/notification-preference.repository.interface.js';
import { ICityRepository } from '../repositories/interfaces/city.repository.interface.js';
import { ICinemaRepository } from '../repositories/interfaces/cinema.repository.interface.js';
import { IEmailVerificationTokenRepository } from '../repositories/interfaces/email-verification-token.repository.interface.js';
import { IRefreshTokenRepository } from '../repositories/interfaces/refresh-token.repository.interface.js';
import { ILoginAuditRepository } from '../repositories/interfaces/login-audit.repository.interface.js';
import { IPasswordResetTokenRepository } from '../repositories/interfaces/password-reset-token.repository.interface.js';

import { IPasswordService } from './interfaces/password.service.interface.js';
import { ITokenService } from './interfaces/token.service.interface.js';
import { IEmailVerificationTokenService } from './interfaces/email-verification-token.service.interface.js';

import { isValidPassword } from '../utils/password.util.js';
import { sendActivationEmail, sendPasswordResetEmail } from '../config/mailer.js';
import { generateMembershipCode } from '../utils/crypto.util.js';

import {
  AccountAlreadyActivatedError,
  AccountLockedError,
  AccountNotActivatedError,
  EmailAlreadyExistsError,
  ExpiredTokenError,
  InvalidCredentialsError,
  InvalidTokenError,
  PasswordMismatchError,
  UserNotFoundError,
  WeakPasswordError,
} from '../errors/auth.errors.js';

const ROLE_NAME = 'cliente';
const MEMBERSHIP_LEVEL_NAME = 'BÁSICA';
const MEMBERSHIP_STATUS_NAME = 'Activa';

/**
 * Servicio encargado de gestionar los procesos de autenticación,
 * registro y ciclo de vida de credenciales de usuarios.
 *
 * @business
 * - Valida consentimientos, correos y fortaleza de contraseña en registro.
 * - Verifica integridad de referencias geográficas y catálogos.
 * - Coordina la creación atómica transaccional de Usuario, Perfil, Membresía Digital,
 *   Billetera de Bonos, Historial y Preferencias.
 * - Gestiona tokens de activación y verificación de correo.
 * - Audita intentos de autenticación y gestiona bloqueos por intentos fallidos.
 * - Emite y rota tokens JWT y tokens de refresco.
 *
 * @implements {IAuthService}
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly profileRepository: IProfileRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly membershipLevelRepository: IMembershipLevelRepository,
    private readonly membershipStatusRepository: IMembershipStatusRepository,
    private readonly bonusWalletRepository: IBonusWalletRepository,
    private readonly purchaseHistoryRepository: IPurchaseHistoryRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
    private readonly cityRepository: ICityRepository,
    private readonly cinemaRepository: ICinemaRepository,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly loginAuditRepository: ILoginAuditRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly emailVerificationTokenService: IEmailVerificationTokenService,
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.profileRepository = profileRepository;
    this.membershipRepository = membershipRepository;
    this.membershipLevelRepository = membershipLevelRepository;
    this.membershipStatusRepository = membershipStatusRepository;
    this.bonusWalletRepository = bonusWalletRepository;
    this.purchaseHistoryRepository = purchaseHistoryRepository;
    this.notificationPreferenceRepository = notificationPreferenceRepository;
    this.cityRepository = cityRepository;
    this.cinemaRepository = cinemaRepository;
    this.emailVerificationTokenRepository = emailVerificationTokenRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.loginAuditRepository = loginAuditRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
    this.emailVerificationTokenService = emailVerificationTokenService;
  }

  /**
   * Valida los datos de entrada del registro (Fail-Fast).
   */
  private validateRegistrationInput(dto: RegisterUserRequestDto): string {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const confirmEmail = dto.confirmEmail ? dto.confirmEmail.trim().toLowerCase() : '';

    if (!dto.personalDataConsent || !dto.termsConsent) {
      throw new Error(
        'Debe aceptar los términos y condiciones y el tratamiento de datos personales.',
      );
    }

    if (email !== confirmEmail) {
      throw new Error('Los correos no coinciden');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new PasswordMismatchError();
    }

    if (!dto.password || !isValidPassword(dto.password)) {
      throw new WeakPasswordError();
    }

    return email;
  }

  /**
   * Resuelve y valida las referencias de catálogo necesarias para el registro.
   */
  private async resolveRegistrationReferences(dto: RegisterUserRequestDto) {
    const defaultRole = await this.roleRepository.findByName(ROLE_NAME);
    if (!defaultRole) {
      throw new Error('No existe el rol por defecto configurado en el sistema');
    }

    const defaultLevel = await this.membershipLevelRepository.findByName(MEMBERSHIP_LEVEL_NAME);
    if (!defaultLevel) {
      throw new Error('No existe el nivel de membresía por defecto configurado en el sistema');
    }

    const defaultStatus = await this.membershipStatusRepository.findByName(MEMBERSHIP_STATUS_NAME);
    if (!defaultStatus) {
      throw new Error('No existe el estado de membresía por defecto configurado en el sistema');
    }

    const city = await this.cityRepository.findById(dto.cityId);
    if (!city) {
      throw new Error('La ciudad principal seleccionada no existe');
    }

    if (dto.favoriteCinemaId) {
      const cinema = await this.cinemaRepository.findById(dto.favoriteCinemaId);
      if (!cinema) {
        throw new Error('El complejo favorito seleccionado no existe');
      }
    }

    return { defaultRole, defaultLevel, defaultStatus };
  }

  /**
   * Registra un nuevo usuario en el sistema junto con su perfil y membresía digital.
   */
  async register(dto: RegisterUserRequestDto): Promise<RegisterUserResult> {
    const email = this.validateRegistrationInput(dto);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const { defaultRole, defaultLevel, defaultStatus } =
      await this.resolveRegistrationReferences(dto);

    const { hash: passwordHash } = await this.passwordService.hash(dto.password);
    const emailVerificationToken = await this.emailVerificationTokenService.generate();

    let membershipCode = '';

    const persistRegistration = async (transaction: Transaction) => {
      // 1. Crear usuario
      const user = await this.userRepository.create(
        {
          roleId: defaultRole.id,
          email,
          passwordHash,
          isActive: false,
          personalDataConsent: true,
          termsConsent: true,
          commercialConsent: !!dto.commercialConsent,
        },
        transaction,
      );

      // 2. Crear perfil
      await this.profileRepository.create(
        {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          birthDate: new Date(dto.birthDate),
          gender: dto.gender || null,
          phone: dto.phone,
          cityId: dto.cityId,
          favoriteCinemaId: dto.favoriteCinemaId || null,
        },
        transaction,
      );

      // 3. Crear membresía digital con código único reintentable
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        membershipCode = generateMembershipCode();
        try {
          await this.membershipRepository.create(
            {
              userId: user.id,
              code: membershipCode,
              levelId: defaultLevel.id,
              statusId: defaultStatus.id,
              pointsBalance: 0,
            },
            transaction,
          );
          break;
        } catch (error) {
          if (!(error instanceof UniqueConstraintError) || attempt === maxAttempts) {
            throw error;
          }
        }
      }

      // 4. Crear billetera de bonos
      await this.bonusWalletRepository.create(
        {
          userId: user.id,
          balance: 0,
        },
        transaction,
      );

      // 5. Crear historial de compras inicial
      await this.purchaseHistoryRepository.create(
        {
          userId: user.id,
        },
        transaction,
      );

      // 6. Crear preferencias de notificación
      await this.notificationPreferenceRepository.create(
        {
          userId: user.id,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
        },
        transaction,
      );

      // 7. Persistir hash de token de verificación
      await this.emailVerificationTokenRepository.create(
        {
          userId: user.id,
          tokenHash: emailVerificationToken.hash,
          expiresAt: emailVerificationToken.expiresAt,
        },
        transaction,
      );

      return user;
    };

    let createdUser: { id: number; isActive: boolean };
    try {
      createdUser = await sequelize.transaction(persistRegistration);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }

    try {
      await sendActivationEmail(email, emailVerificationToken.token);
    } catch (error) {
      console.error('No se pudo enviar el correo de activación:', error);
    }

    return {
      userId: createdUser.id,
      membershipCode,
      isActive: createdUser.isActive,
    };
  }

  /**
   * Verifica el correo electrónico y activa la cuenta.
   */
  async verifyEmail(dto: VerifyEmailRequestDto): Promise<void> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.isActive) {
      throw new AccountAlreadyActivatedError();
    }

    const verificationRecord = await this.emailVerificationTokenRepository.findLatestUnusedByUserId(
      user.id,
    );

    if (!verificationRecord) {
      throw new InvalidTokenError('Token inválido');
    }

    if (new Date() > verificationRecord.expiresAt) {
      throw new ExpiredTokenError();
    }

    const isMatch = await this.emailVerificationTokenService.verify(
      dto.token,
      verificationRecord.tokenHash,
    );

    if (!isMatch) {
      throw new InvalidTokenError('Token inválido');
    }

    await this.userRepository.activate(user.id);
    await this.emailVerificationTokenRepository.markAsUsed(verificationRecord.id);
  }

  /**
   * Autentica al usuario en el sistema.
   */
  async login(
    dto: LoginUserRequestDto,
    ipAddress?: string,
    deviceUserAgent?: string,
  ): Promise<LoginUserResult> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.loginAuditRepository.create({
        userId: null,
        emailAttempted: email,
        ipAddress: ipAddress || null,
        deviceUserAgent: deviceUserAgent || null,
        status: 'FAILED_USER_NOT_FOUND',
      });
      throw new InvalidCredentialsError();
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.loginAuditRepository.create({
        userId: user.id,
        emailAttempted: email,
        ipAddress: ipAddress || null,
        deviceUserAgent: deviceUserAgent || null,
        status: 'ACCOUNT_LOCKED',
      });
      throw new AccountLockedError();
    }

    if (!user.isActive) {
      await this.loginAuditRepository.create({
        userId: user.id,
        emailAttempted: email,
        ipAddress: ipAddress || null,
        deviceUserAgent: deviceUserAgent || null,
        status: 'ACCOUNT_NOT_ACTIVATED',
      });
      throw new AccountNotActivatedError();
    }

    const isMatch = await this.passwordService.verify(dto.password, user.passwordHash);

    if (!isMatch) {
      await this.userRepository.incrementFailedAttempts(user.id);
      await this.loginAuditRepository.create({
        userId: user.id,
        emailAttempted: email,
        ipAddress: ipAddress || null,
        deviceUserAgent: deviceUserAgent || null,
        status: 'FAILED_PASSWORD',
      });
      throw new InvalidCredentialsError();
    }

    await this.userRepository.resetFailedAttempts(user.id);

    await this.loginAuditRepository.create({
      userId: user.id,
      emailAttempted: email,
      ipAddress: ipAddress || null,
      deviceUserAgent: deviceUserAgent || null,
      status: 'SUCCESS',
    });

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.refreshTokenRepository.revokeAllByUserId(user.id);

    const decodedRefresh = this.tokenService.verifyRefreshToken(refreshToken);
    if (decodedRefresh?.exp) {
      await this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      });
    }

    const profile = await this.profileRepository.findByUserId(user.id);
    const membership = await this.membershipRepository.findByUserId(user.id);

    return {
      userId: user.id,
      accessToken,
      refreshToken,
      profile: profile?.toJSON() || null,
      membership: membership?.toJSON() || null,
    };
  }

  /**
   * Rota el refresh token y emite un nuevo access token.
   */
  async refreshToken(token: string): Promise<LoginUserResult> {
    const decoded = this.tokenService.verifyRefreshToken(token);
    if (!decoded?.sub) {
      throw new InvalidTokenError('Refresh token inválido o expirado');
    }

    const userId = Number(decoded.sub);
    const existingToken = await this.refreshTokenRepository.findByTokenHash(token);
    if (!existingToken || existingToken.isRevoked) {
      throw new InvalidTokenError('Refresh token inválido o revocado');
    }

    await this.refreshTokenRepository.revoke(existingToken.id);

    const accessToken = this.tokenService.generateAccessToken(userId);
    const newRefreshToken = this.tokenService.generateRefreshToken(userId);

    const newDecoded = this.tokenService.verifyRefreshToken(newRefreshToken);
    if (newDecoded?.exp) {
      await this.refreshTokenRepository.create({
        userId,
        tokenHash: newRefreshToken,
        expiresAt: new Date(newDecoded.exp * 1000),
      });
    }

    const profile = await this.profileRepository.findByUserId(userId);
    const membership = await this.membershipRepository.findByUserId(userId);

    return {
      userId,
      accessToken,
      refreshToken: newRefreshToken,
      profile: profile?.toJSON() || null,
      membership: membership?.toJSON() || null,
    };
  }

  /**
   * Cierra la sesión revocando los tokens de refresco activos.
   */
  async logout(token: string): Promise<void> {
    const decoded = this.tokenService.verifyRefreshToken(token);
    if (decoded?.sub) {
      const userId = Number(decoded.sub);
      await this.refreshTokenRepository.revokeAllByUserId(userId);
    }
  }

  /**
   * Inicia el proceso de recuperación de contraseña.
   */
  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<void> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const { hash } = await this.passwordService.hash(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (e) {
      console.error('Error sending password reset email', e);
    }
  }

  /**
   * Restablece la contraseña de una cuenta con token de recuperación.
   */
  async resetPassword(dto: ResetPasswordRequestDto): Promise<void> {
    if (!dto.newPassword || !dto.confirmPassword || dto.newPassword !== dto.confirmPassword) {
      throw new PasswordMismatchError();
    }

    if (!isValidPassword(dto.newPassword)) {
      throw new WeakPasswordError();
    }

    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidTokenError();
    }

    const tokenRecord = await this.passwordResetTokenRepository.findLatestUnusedByUserId(user.id);

    if (!tokenRecord) {
      throw new InvalidTokenError();
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new ExpiredTokenError();
    }

    const isMatch = await this.passwordService.verify(dto.token, tokenRecord.tokenHash);

    if (!isMatch) {
      throw new InvalidTokenError();
    }

    const { hash: newPasswordHash } = await this.passwordService.hash(dto.newPassword);

    await this.userRepository.updatePassword(user.id, newPasswordHash);
    await this.passwordResetTokenRepository.markAsUsed(tokenRecord.id);
  }
}

export default AuthService;
