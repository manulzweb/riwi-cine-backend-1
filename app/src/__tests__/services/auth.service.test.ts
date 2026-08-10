// app/src/__tests__/services/auth.service.test.ts

import authService from '../../services/auth.service';
import {
  User,
  Role,
  MembershipLevel,
  MembershipStatus,
  Membership,
  Profile,
  BonusWallet,
  NotificationPreference,
  EmailVerificationToken,
  City,
  Cinema
} from '../../models';
import userRepository from '../../repositories/user.repository';
import { sendActivationEmail } from '../../config/mailer';

jest.mock('../../models', () => {
  const mockSequelize = {
    transaction: jest.fn((cb) => cb({})),
  };
  return {
    sequelize: mockSequelize,
    User: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
    Role: {
      findOne: jest.fn(),
    },
    MembershipLevel: {
      findOne: jest.fn(),
    },
    MembershipStatus: {
      findOne: jest.fn(),
    },
    Membership: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
    Profile: {
      create: jest.fn(),
    },
    BonusWallet: {
      create: jest.fn(),
    },
    NotificationPreference: {
      create: jest.fn(),
    },
    EmailVerificationToken: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
    City: {
      findByPk: jest.fn(),
    },
    Cinema: {
      findByPk: jest.fn(),
    },
  };
});

jest.mock('../../repositories/user.repository');
jest.mock('../../config/mailer');

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

  it('should successfully register a user, profile, membership, wallet, preference, and verification token', async () => {
    // Arrange mocks
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (Role.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'cliente' });
    (MembershipLevel.findOne as jest.Mock).mockResolvedValue({ id: 10, name: 'BÁSICA' });
    (MembershipStatus.findOne as jest.Mock).mockResolvedValue({ id: 20, name: 'Activa' });
    (City.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Medellín' });
    (Cinema.findByPk as jest.Mock).mockResolvedValue({ id: 2, name: 'Cine 1' });
    (User.create as jest.Mock).mockResolvedValue({ id: 100, email: 'test@example.com' });
    (Membership.findOne as jest.Mock).mockResolvedValue(null); // first code is unique

    // Act
    const result = await authService.register(validDto);

    // Assert
    expect(result.userId).toBe(100);
    expect(result.email).toBe('test@example.com');
    expect(result.membershipCode).toMatch(/^MC-\d{6}-\d{6}$/);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        isActive: false,
        personalDataConsent: true,
        termsConsent: true,
        commercialConsent: true,
      }),
      expect.any(Object)
    );
    expect(Profile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 100,
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '3001234567',
        cityId: 1,
        favoriteCinemaId: 2,
      }),
      expect.any(Object)
    );
    expect(Membership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 100,
        code: result.membershipCode,
        levelId: 10,
        statusId: 20,
      }),
      expect.any(Object)
    );
    expect(BonusWallet.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 100, balance: 0 }),
      expect.any(Object)
    );
    expect(NotificationPreference.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 100, emailEnabled: true }),
      expect.any(Object)
    );
    expect(EmailVerificationToken.create).toHaveBeenCalled();
    expect(sendActivationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });

  it('should throw an error if personal data consent or terms consent is missing', async () => {
    await expect(
      authService.register({ ...validDto, personalDataConsent: false })
    ).rejects.toThrow('Debe aceptar los términos y condiciones y el tratamiento de datos personales.');

    await expect(
      authService.register({ ...validDto, termsConsent: false })
    ).rejects.toThrow('Debe aceptar los términos y condiciones y el tratamiento de datos personales.');
  });

  it('should throw an error if emails do not match', async () => {
    await expect(
      authService.register({ ...validDto, confirmEmail: 'different@example.com' })
    ).rejects.toThrow('Los correos no coinciden');
  });

  it('should throw an error if passwords do not match', async () => {
    await expect(
      authService.register({ ...validDto, confirmPassword: 'DifferentPassword123!' })
    ).rejects.toThrow('Las contraseñas no coinciden');
  });

  it('should throw an error if password does not meet requirements', async () => {
    await expect(
      authService.register({ ...validDto, password: '123', confirmPassword: '123' })
    ).rejects.toThrow('La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial.');
  });

  it('should throw an error if email is already registered', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });
    await expect(authService.register(validDto)).rejects.toThrow('El correo ya se encuentra registrado');
  });

  it('should throw an error if city does not exist', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (City.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(validDto)).rejects.toThrow('La ciudad principal seleccionada no existe');
  });

  it('should throw an error if favorite cinema is provided but does not exist', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (City.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
    (Cinema.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(validDto)).rejects.toThrow('El complejo favorito seleccionado no existe');
  });
});
