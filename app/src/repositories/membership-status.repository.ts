// app/src/repositories/membership-status.repository.ts

import { Transaction } from 'sequelize';
import MembershipStatus, {
  MembershipStatusCreationAttributes,
} from '../models/membership-status.model';
import { IMembershipStatusRepository } from './interfaces/membership-status.repository.interface';

/**
 * Repositorio de Estados de Membresía
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad MembershipStatus.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class MembershipStatusRepository implements IMembershipStatusRepository {
  /**
   * Crea un nuevo estado de membresía.
   */
  async create(
    data: MembershipStatusCreationAttributes,
    transaction?: Transaction,
  ): Promise<MembershipStatus> {
    return await MembershipStatus.create(data, { transaction });
  }

  /**
   * Busca un estado de membresía por su identificador.
   */
  async findById(id: number): Promise<MembershipStatus | null> {
    return await MembershipStatus.findByPk(id);
  }

  /**
   * Busca un estado de membresía por su nombre.
   */
  async findByName(name: string): Promise<MembershipStatus | null> {
    return await MembershipStatus.findOne({ where: { name } });
  }
}

export default new MembershipStatusRepository();
