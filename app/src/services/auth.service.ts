import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Role, EmailVerificationToken } from '../models';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { IAuthService, RegisterResult } from './interfaces/auth.service.interface';
import { isValidPassword } from '../utils/password.util';
import { sendActivationEmail } from '../config/mailer';
import userRepository from '../repositories/user.repository';

const activationTokenTime = 24;
const roleName = 'cliente';

class AuthService implements IAuthService {
  async register(dto: RegisterUserDto): Promise<RegisterResult> {
    if (dto.email !== dto.confirmEmail) {
      throw new Error('Los correos no coinciden');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    if (!isValidPassword(dto.password)) {
      throw new Error(
        'La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial.',
      );
    }

    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('El correo ya se encuentra registrado');
    }

    const defaultRole = await Role.findOne({ where: { id: roleName } });
    if (!defaultRole) {
      throw new Error('No existe el rol por defecto configurado en el sistema');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + activationTokenTime * 60 * 60 * 1000);

    const user = await userRepository.create({
      roleId: defaultRole.id,
      email: dto.email,
      passwordHash,
      isActive: false,
    });

    await EmailVerificationToken.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    try {
      await sendActivationEmail(dto.email, rawToken);
    } catch (error) {
      console.error('No se pudo enviar el correo de activación:' + error);
    }
    return { userId: user.id, email: dto.email };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const user = await User.findOne({ where: { email: dto.email } });
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

    const isMatch = bcrypt.compare(dto.token, verificationRecord.tokenHash);
    if (!isMatch) {
      throw new Error('Token Inválido');
    }

    await userRepository.activate(user.id);
    await verificationRecord.update({ usedAt: new Date() });
  }
}

export default new AuthService();
