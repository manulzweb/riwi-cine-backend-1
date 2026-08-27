// app/src/services/city.service.ts

import City from '../models/city.model.js';
import repository from '../repositories/city.repository.js';
import { ICityService } from './interfaces/city.service.interface.js';

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con las ciudades.
 *
 * Responsabilidades:
 * - Exponer las ciudades asociadas a un departamento.
 * - Mantener la lógica de negocio fuera de los controladores.
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas al
 * correspondiente repository.
 *
 * @class CityService
 *
 * @business
 * Las ciudades dependen jerárquicamente de los departamentos. Esta
 * relación es utilizada por el flujo de ubicación del usuario
 * (`País → Departamento → Ciudad`).
 */
class CityService implements ICityService {
  /**
   * Obtiene todas las ciudades pertenecientes a un departamento.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @param {number} departmentId
   * Identificador único del departamento cuyas ciudades se desean consultar.
   *
   * @returns {Promise<City[]>}
   * Lista de ciudades asociadas al departamento indicado.
   */
  async findByDepartmentId(departmentId: number): Promise<City[]> {
    return await repository.findByDepartmentId(departmentId);
  }
}

/**
 * Instancia única del servicio de ciudades utilizada por la aplicación.
 *
 * @constant
 * @type {CityService}
 */
export default new CityService();
