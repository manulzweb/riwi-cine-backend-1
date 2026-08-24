// app/src/repositories/membership.repository.ts

import { Transaction } from 'sequelize';
import Membership, { MembershipCreationAttributes } from '../models/membership.model';
import { IMembershipRepository } from './interfaces/membership.repository.interface';

/**
 * Repositorio de Membresías
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Membership.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
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
  async findByUserId(userId: number): Promise<Membership | null> {
    return await Membership.findOne({ where: { userId } });
  }
}

export default new MembershipRepository();
