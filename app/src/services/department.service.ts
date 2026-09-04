// app/src/services/department.service.ts

import Department from '../models/department.model.js';
import { IDepartmentService } from './interfaces/department.service.interface.js';
import { IDepartmentRepository } from '../repositories/interfaces/department.repository.interface.js';

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con los departamentos.
 *
 * Responsabilidades:
 * - Exponer los departamentos asociados a un país.
 * - Mantener la lógica de negocio fuera de los controladores.
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas al
 * correspondiente repository.
 *
 * @class DepartmentService
 * @implements {IDepartmentService}
 *
 * @business
 * Los departamentos dependen jerárquicamente de los países. Esta
 * relación es utilizada por el flujo de ubicación del usuario
 * (`País → Departamento → Ciudad`).
 */
class DepartmentService implements IDepartmentService {
  constructor(private readonly departmentRepository: IDepartmentRepository) {
    this.departmentRepository = departmentRepository;
  }
  /**
   * Obtiene todos los departamentos pertenecientes a un país.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @param {number} countryId
   * Identificador único del país cuyos departamentos se desean consultar.
   *
   * @returns {Promise<Department[]>}
   * Lista de departamentos asociados al país indicado.
   */
  async findByCountryId(countryId: number): Promise<Department[]> {
    return await this.departmentRepository.findByCountryId(countryId);
  }
}

export default DepartmentService;
