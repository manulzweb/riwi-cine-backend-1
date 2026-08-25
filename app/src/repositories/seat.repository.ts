// app/src/repositories/seat.repository.ts

import { Op } from 'sequelize';
import { ISeatRepository } from './interfaces/seat.repository.interface';
import Seat from '../models/seat.model';
import SeatType from '../models/seat-type.model';
import CinemaFunction from '../models/function.model';

class SeatRepository implements ISeatRepository {
  /**
   * Obtiene todas las sillas correspondientes a la sala
   * donde se realiza una función.
   */
  async findByFunctionId(functionId: number): Promise<Seat[]> {
    const cinemaFunction = await CinemaFunction.findByPk(functionId);

    if (!cinemaFunction) {
      throw new Error('La función no existe.');
    }

    if (!cinemaFunction.roomId) {
      throw new Error('La función no tiene una sala asociada.');
    }

    return await Seat.findAll({
      where: {
        roomId: cinemaFunction.roomId,
        isActive: true,
      },
      include: [
        {
          model: SeatType,
          as: 'seatType',
        },
      ],
      order: [
        ['row', 'ASC'],
        ['number', 'ASC'],
      ],
    });
  }

  /**
   * Obtiene las sillas solicitadas verificando que pertenezcan
   * a la sala de la función.
   */
  async findByIds(seatIds: number[], functionId: number): Promise<Seat[]> {
    const cinemaFunction = await CinemaFunction.findByPk(functionId);

    if (!cinemaFunction) {
      throw new Error('La función no existe.');
    }

    if (!cinemaFunction.roomId) {
      throw new Error('La función no tiene una sala asociada.');
    }

    return await Seat.findAll({
      where: {
        id: {
          [Op.in]: seatIds,
        },
        roomId: cinemaFunction.roomId,
        isActive: true,
      },
      include: [
        {
          model: SeatType,
          as: 'seatType',
        },
      ],
      order: [
        ['row', 'ASC'],
        ['number', 'ASC'],
      ],
    });
  }

  /**
   * Obtiene una silla por su identificador.
   */
  async findById(seatId: number): Promise<Seat | null> {
    return await Seat.findByPk(seatId, {
      include: [
        {
          model: SeatType,
          as: 'seatType',
        },
      ],
    });
  }
}

export default new SeatRepository();
