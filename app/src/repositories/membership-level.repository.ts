// app/src/repositories/membership-level.repository.ts

import { Transaction } from 'sequelize';
import MembershipLevel, {
  MembershipLevelCreationAttributes,
} from '../models/membership-level.model.js';
import { IMembershipLevelRepository } from './interfaces/membership-level.repository.interface.js';

/**
 * Repositorio de Niveles de Membresía
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad MembershipLevel.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class MembershipLevelRepository implements IMembershipLevelRepository {
  /**
   * Crea un nuevo nivel de membresía.
   */
  async create(
    data: MembershipLevelCreationAttributes,
    transaction?: Transaction,
  ): Promise<MembershipLevel> {
    return await MembershipLevel.create(data, { transaction });
  }

  /**
   * Busca un nivel de membresía por su identificador.
   */
  async findById(id: number): Promise<MembershipLevel | null> {
    return await MembershipLevel.findByPk(id);
  }

  /**
   * Busca un nivel de membresía por su nombre.
   */
  async findByName(name: string): Promise<MembershipLevel | null> {
    return await MembershipLevel.findOne({ where: { name } });
  }
}

export default MembershipLevelRepository;
