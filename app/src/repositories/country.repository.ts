// app/src/repositories/country.repository.ts

import Country from '../models/country.model.js';
import { ICountryRepository } from './interfaces/country.repository.interface.js';

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
  async findById(id: number): Promise<Country | null> {
    return await Country.findByPk(id);
  }
}

export default CountryRepository;
