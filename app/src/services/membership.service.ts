// app/src/services/membership.service.ts

import QRCode from 'qrcode';
import { IMembershipService } from './interfaces/membership.service.interface.js';
import { IMembershipRepository } from '../repositories/interfaces/membership.repository.interface.js';
import { IMembershipLevelRepository } from '../repositories/interfaces/membership-level.repository.interface.js';
import { IMembershipStatusRepository } from '../repositories/interfaces/membership-status.repository.interface.js';
import { IBonusWalletRepository } from '../repositories/interfaces/bonus-wallet.repository.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { MembershipDetailResponseDto } from '../dto/response/membership-detail.dto.js';
import {
  MembershipBenefitsResponseDto,
  MembershipBenefitItem,
} from '../dto/response/membership-benefits.dto.js';
import { UserNotFoundError } from '../errors/auth.errors.js';
import { generateMembershipCode } from '../utils/crypto.util.js';
import User from '../models/user.model.js';
import MembershipLevel from '../models/membership-level.model.js';
import MembershipStatus from '../models/membership-status.model.js';

const LEVEL_POINTS_REQUIREMENTS: Record<
  string,
  { nextLevel: string; points: number; discount: number }
> = {
  BÁSICA: { nextLevel: 'ESTÁNDAR', points: 300, discount: 5 },
  ESTÁNDAR: { nextLevel: 'PREMIUM', points: 800, discount: 10 },
  PREMIUM: { nextLevel: 'PREMIUM', points: 800, discount: 10 },
};

/**
 * Servicio encargado de la gestión de Membresías Digitales y Beneficios (HU-008).
 *
 * Responsabilidades:
 * - Consultar el estado y puntos de la membresía del usuario autenticado.
 * - Generar el código QR intransferible y único (RN-033).
 * - Calcular los descuentos activos según el nivel (Básica 0%, Estándar 5%, Premium 10% - RN-032).
 * - Exponer los beneficios vigentes, saldo de billetera y progreso hacia el siguiente nivel.
 *
 * @class MembershipService
 * @implements {IMembershipService}
 */
import {
  MembershipNotFoundError,
  DuplicateMembershipError,
  MembershipLevelNotFoundError,
  MembershipStatusNotFoundError,
} from '../errors/membership.errors.js';

export class MembershipService implements IMembershipService {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly membershipLevelRepository: IMembershipLevelRepository,
    private readonly membershipStatusRepository: IMembershipStatusRepository,
    private readonly bonusWalletRepository: IBonusWalletRepository,
    private readonly userRepository: IUserRepository,
  ) {
    this.membershipRepository = membershipRepository;
    this.membershipLevelRepository = membershipLevelRepository;
    this.membershipStatusRepository = membershipStatusRepository;
    this.bonusWalletRepository = bonusWalletRepository;
    this.userRepository = userRepository;
  }

  /**
   * Crea manualmente una membresía para un usuario.
   */
  async createMembership(userId: number): Promise<{ id: number; code: string }> {
    await this.ensureUserExists(userId);
    await this.ensureUserHasNoActiveMembership(userId);

    const { defaultLevel, defaultStatus } = await this.resolveDefaultCatalogs();
    const code = await this.generateUniqueCode();

    const created = await this.membershipRepository.create({
      userId,
      code,
      levelId: defaultLevel.id,
      statusId: defaultStatus.id,
      pointsBalance: 0,
    });

    return { id: created.id, code: created.code };
  }

  /**
   * Obtiene el detalle de la membresía del usuario autenticado.
   */
  async getMembership(userId: number): Promise<MembershipDetailResponseDto> {
    await this.ensureUserExists(userId);

    const membership = await this.membershipRepository.findByUserIdWithDetails(userId);
    if (!membership) {
      throw new MembershipNotFoundError();
    }

    const bonusWallet = await this.bonusWalletRepository.findByUserId(userId);
    const level = membership.get('level') as
      { name?: string; description?: string; discountPercentage?: number } | undefined;
    const status = membership.get('status') as { name?: string; description?: string } | undefined;
    const qrCodeUrl = await this.generateQrCode(membership.code);

    return {
      userId,
      code: membership.code,
      qrCodeUrl,
      level: {
        name: level?.name ?? 'BÁSICA',
        description: level?.description ?? 'Nivel inicial de membresía',
        discountPercentage: Number(level?.discountPercentage ?? 0),
      },
      status: {
        name: status?.name ?? 'Activa',
        description: status?.description ?? 'Membresía activa',
      },
      pointsBalance: membership.pointsBalance,
      bonusBalance: bonusWallet ? Number(bonusWallet.balance) : 0,
      createdAt: membership.createdAt,
    };
  }

  /**
   * Obtiene los beneficios y descuentos calculados para el usuario autenticado (RN-032).
   */
  async getBenefits(userId: number): Promise<MembershipBenefitsResponseDto> {
    const membershipData = await this.getMembership(userId);
    const levelName = membershipData.level.name.toUpperCase();
    const discount = membershipData.level.discountPercentage;

    const benefits = this.buildBenefitsList(levelName, discount, membershipData.bonusBalance);
    const nextLevel = this.calculateNextLevel(levelName, membershipData.pointsBalance);

    return {
      currentLevel: membershipData.level.name,
      discountPercentage: discount,
      pointsBalance: membershipData.pointsBalance,
      bonusBalance: membershipData.bonusBalance,
      benefits,
      nextLevel,
    };
  }

  // ==========================================================================
  // Funciones Privadas Helper
  // ==========================================================================

  /**
   * Valida la existencia del usuario.
   */
  private async ensureUserExists(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  /**
   * Valida que el usuario no tenga ya una membresía asignada.
   */
  private async ensureUserHasNoActiveMembership(userId: number): Promise<void> {
    const existingMembership = await this.membershipRepository.findByUserId(userId);
    if (existingMembership) {
      throw new DuplicateMembershipError();
    }
  }

  /**
   * Resuelve el nivel y estado por defecto de membresía.
   */
  private async resolveDefaultCatalogs(): Promise<{
    defaultLevel: MembershipLevel;
    defaultStatus: MembershipStatus;
  }> {
    const defaultLevel = await this.membershipLevelRepository.findByName('BÁSICA');
    if (!defaultLevel) {
      throw new MembershipLevelNotFoundError('Nivel de membresía por defecto no configurado.');
    }

    const defaultStatus = await this.membershipStatusRepository.findByName('Activa');
    if (!defaultStatus) {
      throw new MembershipStatusNotFoundError('Estado de membresía por defecto no configurado.');
    }

    return { defaultLevel, defaultStatus };
  }

  /**
   * Genera un código de membresía único y no colisionante.
   */
  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const code = generateMembershipCode();
      const existing = await this.membershipRepository.findByCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('No se pudo generar un código único de membresía.');
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
   * Construye la lista de beneficios dinámicos según el nivel y saldos (RN-032).
   */
  private buildBenefitsList(
    levelName: string,
    discount: number,
    bonusBalance: number,
  ): MembershipBenefitItem[] {
    const benefits: MembershipBenefitItem[] = [
      {
        type: 'TICKET_DISCOUNT',
        title: `Descuento en Boletas (${discount}%)`,
        description: `Descuento directo del ${discount}% aplicado en todas tus compras de entradas de cine.`,
        discountPercentage: discount,
      },
      {
        type: 'POINTS_PROGRAM',
        title: 'Acumulación de Puntos',
        description:
          'Acumula 1 punto por cada $1.000 COP en compras de boletas y confitería para subir de nivel.',
      },
    ];

    if (levelName === 'ESTÁNDAR' || levelName === 'PREMIUM') {
      benefits.push({
        type: 'FREE_REFILL',
        title: 'Refill Gratis en Gaseosa',
        description: '1 refill gratis en gaseosas de 32oz en confitería presentando tu código QR.',
      });
    }

    if (levelName === 'PREMIUM') {
      benefits.push({
        type: 'VIP_ACCESS',
        title: 'Fila Preferencial y Salas VIP',
        description:
          'Acceso prioritario a taquilla y confitería, y descuento especial en salas VIP e IMAX.',
        discountPercentage: 15,
      });
    }

    if (bonusBalance > 0) {
      benefits.push({
        type: 'BONUS_WALLET',
        title: 'Saldo en Billetera de Bonos',
        description: `Tienes disponible $${bonusBalance.toLocaleString('es-CO')} en bonos canjeables en el carrito de compras.`,
        value: bonusBalance,
      });
    }

    return benefits;
  }

  /**
   * Calcula el progreso hacia el siguiente nivel de membresía.
   */
  private calculateNextLevel(levelName: string, currentPoints: number) {
    if (levelName === 'PREMIUM') {
      return null;
    }

    const nextConfig = LEVEL_POINTS_REQUIREMENTS[levelName] ?? LEVEL_POINTS_REQUIREMENTS.BÁSICA;
    const remaining = Math.max(0, nextConfig.points - currentPoints);

    return {
      name: nextConfig.nextLevel,
      discountPercentage: nextConfig.discount,
      pointsRequired: nextConfig.points,
      pointsRemaining: remaining,
    };
  }
}

export default MembershipService;
