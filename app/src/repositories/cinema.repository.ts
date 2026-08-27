// app/src/repositories/cinema.repository.ts

import { Transaction } from 'sequelize';
import Cinema, { CinemaCreationAttributes } from '../models/cinema.model.js';
import City from '../models/city.model.js';
import { ICinemaRepository } from './interfaces/cinema.repository.interface.js';

/**
 * Repositorio de Cines
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Cinema.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class CinemaRepository implements ICinemaRepository {
  /**
   * Crea un nuevo cine.
   */
  async create(data: CinemaCreationAttributes, transaction?: Transaction): Promise<Cinema> {
    return await Cinema.create(data, { transaction });
  }

  /**
   * Busca un cine por su identificador.
   */
  async findById(id: number): Promise<Cinema | null> {
    return await Cinema.findByPk(id);
  }

  /**
   * Obtiene todos los cines de una ciudad.
   */
  async findByCityId(cityId: number): Promise<Cinema[]> {
    return await Cinema.findAll({ where: { cityId } });
  }

  /**
   * Obtiene todos los cines de una ciudad (legado por nombre, deprecated).
   * @deprecated usar findByCityId
   */
  async findByCity(city: string): Promise<Cinema[]> {
    const cityRecord = await City.findOne({ where: { name: city } });
    if (!cityRecord) return [];
    return await Cinema.findAll({ where: { cityId: cityRecord.id } });
  }
}

export default new CinemaRepository();
