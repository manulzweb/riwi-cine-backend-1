// app/src/services/auth.service.ts

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Transaction } from 'sequelize';
import {
  sequelize,
  User,
  Role,
  EmailVerificationToken,
  Profile,
  Membership,
  MembershipLevel,
  MembershipStatus,
  BonusWallet,
  NotificationPreference,
  City,
  Cinema,
} from '../models';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { IAuthService, RegisterResult } from './interfaces/auth.service.interface';
import { isValidPassword } from '../utils/password.util';
import { sendActivationEmail } from '../config/mailer';
import userRepository from '../repositories/user.repository';

const activationTokenTime = process.env.ACTIVATION_TOKEN_EXPIRE_HOURS
  ? Number(process.env.ACTIVATION_TOKEN_EXPIRE_HOURS)
  : 24;
const roleName = 'cliente';

class AuthService implements IAuthService {
  async register(dto: RegisterUserDto): Promise<RegisterResult> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const confirmEmail = dto.confirmEmail ? dto.confirmEmail.trim().toLowerCase() : '';

    if (!dto.personalDataConsent || !dto.termsConsent) {
      throw new Error('Debe aceptar los términos y condiciones y el tratamiento de datos personales.');
    }

    if (email !== confirmEmail) {
      throw new Error('Los correos no coinciden');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    if (!dto.password || !isValidPassword(dto.password)) {
      throw new Error(
        'La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial.',
      );
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo ya se encuentra registrado');
    }

    // Validate default role
    const defaultRole = await Role.findOne({ where: { name: roleName } });
    if (!defaultRole) {
      throw new Error('No existe el rol por defecto configurado en el sistema');
    }

    // Validate membership default config
    const defaultLevel = await MembershipLevel.findOne({ where: { name: 'BÁSICA' } });
    if (!defaultLevel) {
      throw new Error('No existe el nivel de membresía por defecto configurado en el sistema');
    }
    const defaultStatus = await MembershipStatus.findOne({ where: { name: 'Activa' } });
    if (!defaultStatus) {
      throw new Error('No existe el estado de membresía por defecto configurado en el sistema');
    }

    // Validate preferences references
    const city = await City.findByPk(dto.cityId);
    if (!city) {
      throw new Error('La ciudad principal seleccionada no existe');
    }

    if (dto.favoriteCinemaId) {
      const cinema = await Cinema.findByPk(dto.favoriteCinemaId);
      if (!cinema) {
        throw new Error('El complejo favorito seleccionado no existe');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + activationTokenTime * 60 * 60 * 1000);

    let membershipCode = '';

    // Transaction to ensure atomicity
    const result = await sequelize.transaction(async (t: Transaction) => {
      // 1. Create User Account
      const user = await User.create(
        {
          roleId: defaultRole.id,
          email,
          passwordHash,
          isActive: false,
          personalDataConsent: true,
          termsConsent: true,
          commercialConsent: !!dto.commercialConsent,
        },
        { transaction: t },
      );

      // 2. Create Profile
      await Profile.create(
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
        { transaction: t },
      );

      // 3. Generate unique membership code
      let isUnique = false;
      while (!isUnique) {
        membershipCode = 'MC-' + Math.floor(100000 + Math.random() * 900000) + '-' + Math.floor(100000 + Math.random() * 900000);
        const existing = await Membership.findOne({ where: { code: membershipCode }, transaction: t });
        if (!existing) {
          isUnique = true;
        }
      }

      // 4. Create Membership
      await Membership.create(
        {
          userId: user.id,
          code: membershipCode,
          levelId: defaultLevel.id,
          statusId: defaultStatus.id,
          pointsBalance: 0,
        },
        { transaction: t },
      );

      // 5. Create Bonus Wallet
      await BonusWallet.create(
        {
          userId: user.id,
          balance: 0,
        },
        { transaction: t },
      );

      // 6. Create Notification Preference
      await NotificationPreference.create(
        {
          userId: user.id,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
        },
        { transaction: t },
      );

      // 7. Create Verification Token
      await EmailVerificationToken.create(
        {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
        { transaction: t },
      );

      return user;
    });

    try {
      await sendActivationEmail(email, rawToken);
    } catch (error) {
      console.error('No se pudo enviar el correo de activación: ' + error);
    }

    return { userId: result.id, email: result.email, membershipCode };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    if (user.isActive) {
      throw new Error('La cuenta ya se encuentra activada');
    }

    const verificationRecord = await EmailVerificationToken.findOne({
      where: { userId: user.id, usedAt: null },
      order: [['createdAt', 'DESC']],
    });

    if (!verificationRecord) {
      throw new Error('Token inválido');
    }
    if (new Date() > verificationRecord.expiresAt) {
      throw new Error('El token ha expirado, solicita uno nuevo');
    }

    const isMatch = await bcrypt.compare(dto.token, verificationRecord.tokenHash);
    if (!isMatch) {
      throw new Error('Token Inválido');
    }

    await userRepository.activate(user.id);
    await verificationRecord.update({ usedAt: new Date() });
  }
}

export default new AuthService();
