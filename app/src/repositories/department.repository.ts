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
   * Busca una departamento por su identificador.
   */
  async findById(id: number): Promise<Department | null> {
    return await Department.findByPk(id);
  }

  /**
   * Obtiene todos los departamentos de un país.
   */
  async findByCountryId(countryId: number): Promise<Department[]> {
    return await Department.findAll({ where: { countryId } });
  }
}

export default DepartmentRepository;
