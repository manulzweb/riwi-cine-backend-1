import { Transaction } from 'sequelize';
import Cinema, { CinemaCreationAttributes } from '../models/cinema.model';
import { ICinemaRepository } from './interfaces/cinema.repository.interface';

class CinemaRepository implements ICinemaRepository {
  async create(data: CinemaCreationAttributes, transaction?: Transaction): Promise<Cinema> {
    return await Cinema.create(data, { transaction });
  }

  async findById(id: number): Promise<Cinema | null> {
    return await Cinema.findByPk(id);
  }

  async findByCity(city: string): Promise<Cinema[]> {
    return await Cinema.findAll({ where: { city } });
  }
}

export default new CinemaRepository();
