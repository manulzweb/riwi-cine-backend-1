// app/src/repositories/country.repository.ts

import Country from '../models/country.model';
import { ICountryRepository } from './interfaces/country.repository.interface';

/**
 * Repositorio de Países
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Country.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class CountryRepository implements ICountryRepository {
  /**
   * Obtiene todos los países.
   */
  async findAll(): Promise<Country[]> {
    return await Country.findAll();
  }
}

export default new CountryRepository();
