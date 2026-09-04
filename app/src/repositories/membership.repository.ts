// app/src/repositories/membership.repository.ts

import { Transaction } from 'sequelize';
import Membership, { MembershipCreationAttributes } from '../models/membership.model.js';
import MembershipLevel from '../models/membership-level.model.js';
import MembershipStatus from '../models/membership-status.model.js';
import { IMembershipRepository } from './interfaces/membership.repository.interface.js';

/**
 * Repositorio de Membresías
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Membership.
 */
class MembershipRepository implements IMembershipRepository {
  /**
   * Crea una nueva membresía.
   */
  async create(data: MembershipCreationAttributes, transaction?: Transaction): Promise<Membership> {
    return await Membership.create(data, { transaction });
  }

  /**
   * Busca una membresía por su código único.
   */
  async findByCode(code: string, transaction?: Transaction): Promise<Membership | null> {
    return await Membership.findOne({ where: { code }, transaction });
  }

  /**
   * Busca la membresía asociada a un usuario.
   */
  async findByUserId(userId: number, transaction?: Transaction): Promise<Membership | null> {
    return await Membership.findOne({ where: { userId }, transaction });
  }

  /**
   * Busca la membresía con sus relaciones de nivel y estado.
   */
  async findByUserIdWithDetails(
    userId: number,
    transaction?: Transaction,
  ): Promise<Membership | null> {
    return await Membership.findOne({
      where: { userId },
      include: [
        { model: MembershipLevel, as: 'level' },
        { model: MembershipStatus, as: 'status' },
      ],
      transaction,
    });
  }
}

export default MembershipRepository;
