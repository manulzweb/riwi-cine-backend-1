// app/src/repositories/department.repository.ts

import Department from '../models/department.model.js';
import { IDepartmentRepository } from './interfaces/department.repository.interface.js';

/**
 * Repositorio de Departamentos
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Department.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class DepartmentRepository implements IDepartmentRepository {
  /**
   * Obtiene todos los departamentos de un país.
   */
  async findByCountryId(countryId: number): Promise<Department[]> {
    return await Department.findAll({ where: { countryId } });
  }
}

export default new DepartmentRepository();
