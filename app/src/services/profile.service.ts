// app/src/services/profile.service.ts

import QRCode from 'qrcode';
import { IProfileService } from './interfaces/profile.service.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { IProfileRepository } from '../repositories/interfaces/profile.repository.interface.js';
import { IMembershipRepository } from '../repositories/interfaces/membership.repository.interface.js';
import { INotificationPreferenceRepository } from '../repositories/interfaces/notification-preference.repository.interface.js';
import { IBonusWalletRepository } from '../repositories/interfaces/bonus-wallet.repository.interface.js';
import { ICityRepository } from '../repositories/interfaces/city.repository.interface.js';
import { ICinemaRepository } from '../repositories/interfaces/cinema.repository.interface.js';
import { UpdateProfileRequestDto } from '../dto/request/update-profile.dto.js';
import { ProfileDetailResponseDto } from '../dto/response/profile-detail.dto.js';
import { UserNotFoundError } from '../errors/auth.errors.js';
import User from '../models/user.model.js';
import Profile from '../models/profile.model.js';
import Membership from '../models/membership.model.js';

/**
 * Servicio encargado de la consulta y administración del perfil de usuario (HU-008).
 *
 * Responsabilidades:
 * - Consultar la información personal completa del usuario autenticado.
 * - Generar el código QR dinámico de la membresía digital (RN-033).
 * - Actualizar datos de contacto y preferencias de notificación.
 * - Validar referencias de ubicación y complejos de cine.
 *
 * @class ProfileService
 * @implements {IProfileService}
 */
export class ProfileService implements IProfileService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly profileRepository: IProfileRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
    private readonly bonusWalletRepository: IBonusWalletRepository,
    private readonly cityRepository: ICityRepository,
    private readonly cinemaRepository: ICinemaRepository,
  ) {
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
    this.membershipRepository = membershipRepository;
    this.notificationPreferenceRepository = notificationPreferenceRepository;
    this.bonusWalletRepository = bonusWalletRepository;
    this.cityRepository = cityRepository;
    this.cinemaRepository = cinemaRepository;
  }

  /**
   * Obtiene el perfil completo del usuario autenticado.
   */
  async getProfile(userId: number): Promise<ProfileDetailResponseDto> {
    const user = await this.ensureUserExists(userId);
    const profile = await this.ensureProfileExists(userId);
    const membership = await this.membershipRepository.findByUserIdWithDetails(userId);
    const bonusWallet = await this.bonusWalletRepository.findByUserId(userId);
    const notificationPrefs = await this.notificationPreferenceRepository.findByUserId(userId);

    const { cityName, favoriteCinemaName } = await this.resolveLocationNames(
      profile.cityId,
      profile.favoriteCinemaId,
    );

    const membershipData = await this.formatMembershipData(membership);

    return {
      userId: user.id,
      email: user.email,
      isActive: user.isActive,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        documentType: profile.documentType,
        documentNumber: profile.documentNumber,
        birthDate: profile.birthDate,
        gender: profile.gender,
        phone: profile.phone,
        cityId: profile.cityId,
        cityName,
        favoriteCinemaId: profile.favoriteCinemaId,
        favoriteCinemaName,
      },
      membership: membershipData,
      bonusWallet: bonusWallet ? { balance: Number(bonusWallet.balance) } : null,
      notificationPreferences: notificationPrefs
        ? {
            emailEnabled: notificationPrefs.emailEnabled,
            smsEnabled: notificationPrefs.smsEnabled,
            pushEnabled: notificationPrefs.pushEnabled,
          }
        : null,
    };
  }

  /**
   * Actualiza los datos del perfil y preferencias de notificación.
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileRequestDto,
  ): Promise<ProfileDetailResponseDto> {
    await this.ensureUserExists(userId);
    await this.validateCityAndCinema(dto.cityId, dto.favoriteCinemaId);

    await this.profileRepository.updateByUserId(userId, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.cityId !== undefined && { cityId: dto.cityId }),
      ...(dto.favoriteCinemaId !== undefined && { favoriteCinemaId: dto.favoriteCinemaId }),
    });

    if (dto.notificationPreferences) {
      await this.notificationPreferenceRepository.updateByUserId(
        userId,
        dto.notificationPreferences,
      );
    }

    return this.getProfile(userId);
  }

  // ==========================================================================
  // Funciones Privadas Helper
  // ==========================================================================

  /**
   * Valida la existencia del usuario en el repositorio.
   */
  private async ensureUserExists(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  /**
   * Valida y obtiene el perfil del usuario.
   */
  private async ensureProfileExists(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Perfil de usuario no encontrado.');
    }
    return profile;
  }

  /**
   * Valida que las referencias de ciudad y complejo de cine existan si fueron enviadas.
   */
  private async validateCityAndCinema(cityId?: number, favoriteCinemaId?: number): Promise<void> {
    if (cityId) {
      const city = await this.cityRepository.findById(cityId);
      if (!city) {
        throw new Error('La ciudad seleccionada no existe.');
      }
    }

    if (favoriteCinemaId) {
      const cinema = await this.cinemaRepository.findById(favoriteCinemaId);
      if (!cinema) {
        throw new Error('El cine favorito seleccionado no existe.');
      }
    }
  }

  /**
   * Resuelve los nombres de la ciudad y cine favorito para la respuesta.
   */
  private async resolveLocationNames(
    cityId: number,
    favoriteCinemaId?: number | null,
  ): Promise<{ cityName?: string; favoriteCinemaName?: string }> {
    let cityName: string | undefined;
    if (cityId) {
      const city = await this.cityRepository.findById(cityId);
      cityName = city?.name;
    }

    let favoriteCinemaName: string | undefined;
    if (favoriteCinemaId) {
      const cinema = await this.cinemaRepository.findById(favoriteCinemaId);
      favoriteCinemaName = cinema?.name;
    }

    return { cityName, favoriteCinemaName };
  }

  /**
   * Genera el código QR en formato Base64 Data URL (RN-033).
   */
  private async generateQrCode(code: string): Promise<string> {
    return await QRCode.toDataURL(code, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
    });
  }

  /**
   * Formatea la estructura de membresía con su código QR.
   */
  private async formatMembershipData(membership: Membership | null) {
    if (!membership) return null;

    const qrCodeUrl = await this.generateQrCode(membership.code);
    const level = membership.get('level') as
      { name?: string; discountPercentage?: number } | undefined;
    const status = membership.get('status') as { name?: string } | undefined;

    return {
      code: membership.code,
      qrCodeUrl,
      level: level?.name ?? 'BÁSICA',
      status: status?.name ?? 'Activa',
      pointsBalance: membership.pointsBalance,
      discountPercentage: Number(level?.discountPercentage ?? 0),
    };
  }
}

export default ProfileService;
