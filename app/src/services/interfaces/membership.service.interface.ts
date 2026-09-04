// app/src/services/interfaces/membership.service.interface.ts

import { MembershipDetailResponseDto } from '../../dto/response/membership-detail.dto.js';
import { MembershipBenefitsResponseDto } from '../../dto/response/membership-benefits.dto.js';

export interface IMembershipService {
  /** Crea manualmente una membresía para un usuario. */
  createMembership(userId: number): Promise<{ id: number; code: string }>;

  /** Obtiene el detalle de la membresía del usuario autenticado. */
  getMembership(userId: number): Promise<MembershipDetailResponseDto>;

  /** Obtiene los beneficios y descuentos calculados para el usuario autenticado (RN-032). */
  getBenefits(userId: number): Promise<MembershipBenefitsResponseDto>;
}
