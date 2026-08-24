// app/src/repositories/role.repository.ts

import { Transaction } from 'sequelize';
import Role, { RoleCreationAttributes } from '../models/role.model';
import { IRoleRepository } from './interfaces/role.repository.interface';

/**
 * Repositorio de Roles
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Role.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class RoleRepository implements IRoleRepository {
  /**
   * Crea un nuevo rol.
   */
  async create(data: RoleCreationAttributes, transaction?: Transaction): Promise<Role> {
    return await Role.create(data, { transaction });
  }

  /**
   * Busca un rol por su identificador.
   */
  async findById(id: number): Promise<Role | null> {
    return await Role.findByPk(id);
  }

  /**
   * Busca un rol por su nombre.
   */
  async findByName(name: string): Promise<Role | null> {
    return await Role.findOne({ where: { name } });
  }
}

export default new RoleRepository();
