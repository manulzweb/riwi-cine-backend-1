// app/src/repositories/function.repository.ts

import { Op, WhereOptions } from 'sequelize';
import CinemaFunction, { FunctionAttributes } from '../models/function.model.js';
import Movie from '../models/movie.model.js';
import Room from '../models/room.model.js';
import { IFunctionRepository } from './interfaces/function.repository.interface.js';
import { FunctionFiltersDto } from '../dto/function-detail.dto.js';

/**
 * Repositorio de Funciones (Showtimes)
 * -----------------------------------
 * Encapsula todas las operaciones de persistencia relacionadas con la entidad `CinemaFunction`.
 */
class FunctionRepository implements IFunctionRepository {
  /**
   * Busca una función por su ID incluyendo la película y la sala asociada.
   */
  async findById(id: number): Promise<CinemaFunction | null> {
    return await CinemaFunction.findByPk(id, {
      include: [
        { model: Movie, as: 'movie' },
        { model: Room, as: 'roomRelation' },
      ],
    });
  }

  /**
   * Obtiene las funciones activas y futuras de una película aplicando filtros opcionales (RN-035, RN-036).
   */
  async findAllByMovie(
    movieId: number,
    filters: FunctionFiltersDto = {},
  ): Promise<CinemaFunction[]> {
    const where: WhereOptions<FunctionAttributes> = {
      movieId,
      isActive: true,
      active: true,
    };

    // RN-035: Solo funciones futuras o con fecha/hora igual/mayor a la actual
    const now = new Date();
    where.startTime = { [Op.gte]: now };

    if (filters.format) {
      where.format = { [Op.iLike]: `%${filters.format.trim()}%` };
    }

    if (filters.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
      where.startTime = {
        [Op.and]: [
          { [Op.gte]: now },
          { [Op.gte]: startOfDay },
          { [Op.lte]: endOfDay },
        ],
      };
    }

    const roomInclude: { model: typeof Room; as: string; where?: { cinemaId: number } } = {
      model: Room,
      as: 'roomRelation',
    };

    if (filters.cinemaId) {
      roomInclude.where = { cinemaId: filters.cinemaId };
    }

    return await CinemaFunction.findAll({
      where,
      include: [{ model: Movie, as: 'movie' }, roomInclude],
      order: [['startTime', 'ASC']],
    });
  }

  /**
   * Obtiene las funciones asociadas a una sala.
   */
  async findByRoomId(roomId: number): Promise<CinemaFunction[]> {
    return await CinemaFunction.findAll({
      where: { roomId, isActive: true },
      order: [['startTime', 'ASC']],
    });
  }
}

export default FunctionRepository;
