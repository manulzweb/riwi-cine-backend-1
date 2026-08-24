// app/src/repositories/cinema.repository.ts

import { Transaction } from 'sequelize';
import Cinema, { CinemaCreationAttributes } from '../models/cinema.model';
import { ICinemaRepository } from './interfaces/cinema.repository.interface';

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
  async findByCity(city: string): Promise<Cinema[]> {
    return await Cinema.findAll({ where: { city } });
  }
}

export default new CinemaRepository();
