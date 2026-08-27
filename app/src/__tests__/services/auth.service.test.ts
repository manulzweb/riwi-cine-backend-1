// app/src/__tests__/services/auth.service.test.ts

import authService from '../../services/auth.service.js';
import userRepository from '../../repositories/user.repository.js';
import roleRepository from '../../repositories/role.repository.js';
import profileRepository from '../../repositories/profile.repository.js';
import membershipRepository from '../../repositories/membership.repository.js';
import membershipLevelRepository from '../../repositories/membership-level.repository.js';
import membershipStatusRepository from '../../repositories/membership-status.repository.js';
import bonusWalletRepository from '../../repositories/bonus-wallet.repository.js';
import purchaseHistoryRepository from '../../repositories/purchase-history.repository.js';
import notificationPreferenceRepository from '../../repositories/notification-preference.repository.js';
import cityRepository from '../../repositories/city.repository.js';
import cinemaRepository from '../../repositories/cinema.repository.js';
import emailVerificationTokenRepository from '../../repositories/email-verification-token.repository.js';
import { sendActivationEmail } from '../../config/mailer.js';
import { EmailAlreadyExistsError } from '../../errors/domain-errors.js';
import { UniqueConstraintError } from 'sequelize';

jest.mock('../../config/database.js', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb) => cb({})),
  },
}));

jest.mock('../../models/user.model.js', () => ({
  __esModule: true,
  default: {
    update: jest.fn(),
  },
}));

jest.mock('../../repositories/user.repository.js', () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    activate: jest.fn(),
  },
}));

jest.mock('../../repositories/role.repository.js', () => ({
  __esModule: true,
  default: {
    findByName: jest.fn(),
  },
}));

jest.mock('../../repositories/profile.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/membership.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByCode: jest.fn(),
  },
}));

jest.mock('../../repositories/membership-level.repository.js', () => ({
  __esModule: true,
  default: {
    findByName: jest.fn(),
  },
}));

jest.mock('../../repositories/membership-status.repository.js', () => ({
  __esModule: true,
  default: {
    findByName: jest.fn(),
  },
}));

jest.mock('../../repositories/bonus-wallet.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/purchase-history.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/notification-preference.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/city.repository.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../repositories/cinema.repository.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../repositories/email-verification-token.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findLatestUnusedByUserId: jest.fn(),
    markAsUsed: jest.fn(),
  },
}));

jest.mock('../../repositories/refresh-token.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    revokeAllByUserId: jest.fn(),
    findByTokenHash: jest.fn(),
    revoke: jest.fn(),
  },
}));

jest.mock('../../repositories/login-audit.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/password-reset-token.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findLatestUnusedByUserId: jest.fn(),
    markAsUsed: jest.fn(),
  },
  passwordResetTokenRepository: {
    create: jest.fn(),
    findLatestUnusedByUserId: jest.fn(),
    markAsUsed: jest.fn(),
  },
}));

jest.mock('../../config/mailer.js');

describe('AuthService · HU-006 Registration', () => {
  const validDto = {
    email: 'Test@Example.com',
    confirmEmail: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '3001234567',
    firstName: 'Juan',
    lastName: 'Pérez',
    documentType: 'CC',
    documentNumber: '12345678',
    birthDate: '1990-01-01',
    gender: 'Masculino',
    cityId: 1,
    favoriteCinemaId: 2,
    personalDataConsent: true,
    termsConsent: true,
    commercialConsent: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register a user, profile, membership, purchase history, wallet, preference, and verification token', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (roleRepository.findByName as jest.Mock).mockResolvedValue({ id: 1, name: 'cliente' });
    (membershipLevelRepository.findByName as jest.Mock).mockResolvedValue({
      id: 10,
      name: 'BÁSICA',
    });
    (membershipStatusRepository.findByName as jest.Mock).mockResolvedValue({
      id: 20,
      name: 'Activa',
    });
    (cityRepository.findById as jest.Mock).mockResolvedValue({ id: 1, name: 'Medellín' });
    (cinemaRepository.findById as jest.Mock).mockResolvedValue({ id: 2, name: 'Cine 1' });
    (userRepository.create as jest.Mock).mockResolvedValue({
      id: 100,
      email: 'test@example.com',
      isActive: false,
    });
    (membershipRepository.findByCode as jest.Mock).mockResolvedValue(null);

    const result = await authService.register(validDto);

    expect(result.userId).toBe(100);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        isActive: false,
        personalDataConsent: true,
        termsConsent: true,
        commercialConsent: true,
      }),
      expect.any(Object),
    );
    expect(profileRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 100,
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '3001234567',
        cityId: 1,
        favoriteCinemaId: 2,
      }),
      expect.any(Object),
    );
    expect(bonusWalletRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 100, balance: 0 }),
      expect.any(Object),
    );
    expect(purchaseHistoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 100 }),
      expect.any(Object),
    );
    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 100,
        code: expect.stringMatching(/^MC-\d{6}-\d{6}$/),
        pointsBalance: 0,
      }),
      expect.any(Object),
    );
    expect(notificationPreferenceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 100, emailEnabled: true }),
      expect.any(Object),
    );
    expect(emailVerificationTokenRepository.create).toHaveBeenCalled();
    expect(sendActivationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });

  it('should throw an error if personal data consent or terms consent is missing', async () => {
    await expect(authService.register({ ...validDto, personalDataConsent: false })).rejects.toThrow(
      'Debe aceptar los términos y condiciones y el tratamiento de datos personales.',
    );

    await expect(authService.register({ ...validDto, termsConsent: false })).rejects.toThrow(
      'Debe aceptar los términos y condiciones y el tratamiento de datos personales.',
    );
  });

  it('should throw an error if emails do not match', async () => {
    await expect(
      authService.register({ ...validDto, confirmEmail: 'different@example.com' }),
    ).rejects.toThrow('Los correos no coinciden');
  });

  it('should throw an error if passwords do not match', async () => {
    await expect(
      authService.register({ ...validDto, confirmPassword: 'DifferentPassword123!' }),
    ).rejects.toThrow('Las contraseñas no coinciden');
  });

  it('should throw an error if password does not meet requirements', async () => {
    await expect(
      authService.register({ ...validDto, password: '123', confirmPassword: '123' }),
    ).rejects.toThrow(
      'La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial.',
    );
  });

  it('should throw EmailAlreadyExistsError if email is already registered', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });
    await expect(authService.register(validDto)).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('should throw EmailAlreadyExistsError when the unique email constraint fails (race condition)', async () => {
    const baseMocks = () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (roleRepository.findByName as jest.Mock).mockResolvedValue({ id: 1 });
      (membershipLevelRepository.findByName as jest.Mock).mockResolvedValue({ id: 10 });
      (membershipStatusRepository.findByName as jest.Mock).mockResolvedValue({ id: 20 });
      (cityRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    };

    baseMocks();
    (userRepository.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));

    await expect(authService.register(validDto)).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('should fail with a business error when no unique membership code can be generated', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (roleRepository.findByName as jest.Mock).mockResolvedValue({ id: 1 });
    (membershipLevelRepository.findByName as jest.Mock).mockResolvedValue({ id: 10 });
    (membershipStatusRepository.findByName as jest.Mock).mockResolvedValue({ id: 20 });
    (cityRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (userRepository.create as jest.Mock).mockResolvedValue({ id: 100, isActive: false });
    (membershipRepository.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));

    await expect(authService.register(validDto)).rejects.toThrow(
      'No se pudo generar un código único de membresía',
    );
    expect(membershipRepository.create).toHaveBeenCalledTimes(3);
  });

  it('should throw an error if city does not exist', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (cityRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(validDto)).rejects.toThrow(
      'La ciudad principal seleccionada no existe',
    );
  });

  it('should throw an error if favorite cinema is provided but does not exist', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (cityRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (cinemaRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(validDto)).rejects.toThrow(
      'El complejo favorito seleccionado no existe',
    );
  });
});
