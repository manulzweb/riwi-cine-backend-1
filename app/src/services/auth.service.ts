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
import { ITokenService } from './interfaces/auth-token.service.interface.js';
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
import User from '../models/user.model.js';
import { PasswordResetTokenInstance } from '../models/password-reset-token.model.js';

const ROLE_NAME = 'cliente';
const MEMBERSHIP_LEVEL_NAME = 'BÁSICA';
const MEMBERSHIP_STATUS_NAME = 'Activa';
const DUMMY_BCRYPT_HASH = '$2b$10$cy6YxvetoHKT6gelchVC8.uoxe0nZx5OU0m68IFzDa2c8SHqWnbKe';

/**
 * Servicio encargado de gestionar los procesos de autenticación,
 * registro y ciclo de vida de credenciales de usuarios (HU-006 / HU-007).
 *
 * @class AuthService
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

  // ==========================================================================
  // --- HU-006: Registro de Usuario y Membresía Digital ---
  // ==========================================================================

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

      membershipCode = await this.createInitialMembership(
        user.id,
        defaultLevel.id,
        defaultStatus.id,
        transaction,
      );

      await this.bonusWalletRepository.create({ userId: user.id, balance: 0 }, transaction);
      await this.purchaseHistoryRepository.create({ userId: user.id }, transaction);
      await this.notificationPreferenceRepository.create(
        {
          userId: user.id,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
        },
        transaction,
      );

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

  // ==========================================================================
  // --- HU-007: Autenticación, Sesiones y Recuperación ---
  // ==========================================================================

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

    await this.validateUserForLogin(user, email, dto.password, ipAddress, deviceUserAgent);

    const isMatch = await this.passwordService.verify(dto.password, user!.passwordHash);

    if (!isMatch) {
      await this.handleFailedPassword(user!.id, email, ipAddress, deviceUserAgent);
      throw new InvalidCredentialsError();
    }

    await this.userRepository.resetFailedAttempts(user!.id);
    await this.recordAudit('SUCCESS', email, user!.id, ipAddress, deviceUserAgent);

    const { accessToken, refreshToken } = await this.issueAndRotateTokens(user!.id, user!.roleId);

    const profile = await this.profileRepository.findByUserId(user!.id);
    const membership = await this.membershipRepository.findByUserId(user!.id);

    return {
      userId: user!.id,
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
    const { userId, accessToken, newRefreshToken } = await this.rotateRefreshToken(token);

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
    const email = this.validateResetPasswordInput(dto);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidTokenError();
    }

    const tokenRecord = await this.getValidPasswordResetToken(user.id, dto.token);
    const { hash: newPasswordHash } = await this.passwordService.hash(dto.newPassword as string);

    await this.userRepository.updatePassword(user.id, newPasswordHash);
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
    await this.passwordResetTokenRepository.markAsUsed(tokenRecord.id);
  }

  // ==========================================================================
  // --- Helpers Privados de Dominio (SRP) ---
  // ==========================================================================

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
   * Crea la membresía inicial con código único reintentable.
   */
  private async createInitialMembership(
    userId: number,
    levelId: number,
    statusId: number,
    transaction: Transaction,
  ): Promise<string> {
    const maxAttempts = 3;
    let membershipCode = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      membershipCode = generateMembershipCode();
      try {
        await this.membershipRepository.create(
          {
            userId,
            code: membershipCode,
            levelId,
            statusId,
            pointsBalance: 0,
          },
          transaction,
        );
        return membershipCode;
      } catch (error) {
        if (!(error instanceof UniqueConstraintError) || attempt === maxAttempts) {
          throw error;
        }
      }
    }

    return membershipCode;
  }

  /**
   * Valida el estado del usuario antes de verificar contraseña (RN-027, RN-031).
   */
  private async validateUserForLogin(
    user: User | null,
    email: string,
    password?: string,
    ipAddress?: string,
    deviceUserAgent?: string,
  ): Promise<void> {
    if (!user) {
      await this.passwordService.verify(password ?? 'dummy_password', DUMMY_BCRYPT_HASH);
      await this.recordAudit('FAILED_USER_NOT_FOUND', email, null, ipAddress, deviceUserAgent);
      throw new InvalidCredentialsError();
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.recordAudit('ACCOUNT_LOCKED', email, user.id, ipAddress, deviceUserAgent);
      throw new AccountLockedError();
    }

    if (!user.isActive) {
      await this.recordAudit('ACCOUNT_NOT_ACTIVATED', email, user.id, ipAddress, deviceUserAgent);
      throw new AccountNotActivatedError();
    }
  }

  /**
   * Registra el fallo de contraseña e incrementa intentos fallidos (RN-027).
   */
  private async handleFailedPassword(
    userId: number,
    email: string,
    ipAddress?: string,
    deviceUserAgent?: string,
  ): Promise<void> {
    await this.userRepository.incrementFailedAttempts(userId);
    await this.recordAudit('FAILED_PASSWORD', email, userId, ipAddress, deviceUserAgent);
  }

  /**
   * Registra una auditoría de login en la base de datos.
   */
  private async recordAudit(
    status: string,
    emailAttempted: string,
    userId?: number | null,
    ipAddress?: string,
    deviceUserAgent?: string,
  ): Promise<void> {
    await this.loginAuditRepository.create({
      userId: userId || null,
      emailAttempted,
      ipAddress: ipAddress || null,
      deviceUserAgent: deviceUserAgent || null,
      status,
    });
  }

  /**
   * Emite tokens y revoca los anteriores en base de datos (RN-028, RN-029, RN-030).
   */
  private async issueAndRotateTokens(
    userId: number,
    roleId?: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let userRoleId = roleId;
    if (userRoleId === undefined) {
      const user = await this.userRepository.findById(userId);
      userRoleId = user?.roleId;
    }

    const accessToken = this.tokenService.generateAccessToken(userId, userRoleId);
    const refreshToken = this.tokenService.generateRefreshToken(userId);

    await this.refreshTokenRepository.revokeAllByUserId(userId);

    const decodedRefresh = this.tokenService.verifyRefreshToken(refreshToken);
    if (decodedRefresh?.exp) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.refreshTokenRepository.create({
        userId,
        tokenHash,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      });
    }

    return { accessToken, refreshToken };
  }

  /**
   * Rota el refresh token verificando su validez y revocación previa.
   */
  private async rotateRefreshToken(token: string): Promise<{
    userId: number;
    accessToken: string;
    newRefreshToken: string;
  }> {
    const decoded = this.tokenService.verifyRefreshToken(token);
    if (!decoded?.sub) {
      throw new InvalidTokenError('Refresh token inválido o expirado');
    }

    const userId = Number(decoded.sub);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const existingToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (!existingToken || existingToken.isRevoked) {
      throw new InvalidTokenError('Refresh token inválido o revocado');
    }

    await this.refreshTokenRepository.revoke(existingToken.id);

    const user = await this.userRepository.findById(userId);
    const { accessToken, refreshToken: newRefreshToken } = await this.issueAndRotateTokens(
      userId,
      user?.roleId,
    );

    return { userId, accessToken, newRefreshToken };
  }

  /**
   * Valida los datos de entrada para el restablecimiento de contraseña.
   */
  private validateResetPasswordInput(dto: ResetPasswordRequestDto): string {
    if (!dto.newPassword || !dto.confirmPassword || dto.newPassword !== dto.confirmPassword) {
      throw new PasswordMismatchError();
    }

    if (!isValidPassword(dto.newPassword)) {
      throw new WeakPasswordError();
    }

    return dto.email ? dto.email.trim().toLowerCase() : '';
  }

  /**
   * Obtiene y valida la vigencia de un token de recuperación de contraseña.
   */
  private async getValidPasswordResetToken(
    userId: number,
    plainToken: string,
  ): Promise<PasswordResetTokenInstance> {
    const tokenRecord = await this.passwordResetTokenRepository.findLatestUnusedByUserId(userId);

    if (!tokenRecord) {
      throw new InvalidTokenError();
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new ExpiredTokenError();
    }

    const isMatch = await this.passwordService.verify(plainToken, tokenRecord.tokenHash);
    if (!isMatch) {
      throw new InvalidTokenError();
    }

    return tokenRecord;
  }
}

export default AuthService;
