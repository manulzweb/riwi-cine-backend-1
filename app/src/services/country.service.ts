// app/src/services/country.service.ts

import Country from '../models/country.model';
import repository from '../repositories/country.repository';
import { ICountryService } from './interfaces/country.service.interface';

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con los países.
 *
 * Responsabilidades:
 * - Exponer el catálogo de países disponibles.
 * - Mantener la lógica de negocio fuera de los controladores.
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas al
 * correspondiente repository.
 *
 * @class CountryService
 *
 * @business
 * Los países constituyen el nivel superior de la jerarquía de
 * ubicación utilizada por el perfil del usuario
 * (`País → Departamento → Ciudad`).
 */
class CountryService implements ICountryService {
  /**
   * Obtiene todos los países registrados.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @returns {Promise<Country[]>}
   * Lista de países registrados.
   */
  async findAll(): Promise<Country[]> {
    return await repository.findAll();
  }
}

/**
 * Instancia única del servicio de países utilizada por la aplicación.
 *
 * @constant
 * @type {CountryService}
 */
export default new CountryService();
