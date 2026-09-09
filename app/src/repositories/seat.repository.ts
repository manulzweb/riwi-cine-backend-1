// app/src/repositories/seat.repository.ts

import { Op, Transaction } from 'sequelize';
import { ISeatRepository } from './interfaces/seat.repository.interface.js';
import Seat from '../models/seat.model.js';
import SeatType from '../models/seat-type.model.js';
import CinemaFunction from '../models/function.model.js';

export class SeatRepository implements ISeatRepository {
  /**
   * Obtiene todas las sillas activas de una sala específica con su tipo de silla.
   */
  async findByRoomId(roomId: number): Promise<Seat[]> {
    return await Seat.findAll({
      where: {
        roomId,
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
   * Obtiene un conjunto de sillas dentro de una sala específica.
   */
  async findByIdsInRoom(
    seatIds: number[],
    roomId: number,
    transaction?: Transaction,
    lock?: boolean,
  ): Promise<Seat[]> {
    return await Seat.findAll({
      where: {
        id: {
          [Op.in]: seatIds,
        },
        roomId,
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
      transaction,
      lock: lock && transaction ? Transaction.LOCK.UPDATE : undefined,
    });
  }

  /**
   * Obtiene todas las sillas de la sala asociada a una función.
   */
  async findByFunctionId(functionId: number): Promise<Seat[]> {
    const cinemaFunction = await CinemaFunction.findByPk(functionId);
    if (!cinemaFunction || !cinemaFunction.roomId) {
      return [];
    }

    return this.findByRoomId(cinemaFunction.roomId);
  }

  /**
   * Obtiene las sillas solicitadas verificando que pertenezcan a la sala de la función.
   */
  async findByIds(
    seatIds: number[],
    functionId: number,
    transaction?: Transaction,
    lock?: boolean,
  ): Promise<Seat[]> {
    const cinemaFunction = await CinemaFunction.findByPk(functionId, { transaction });
    if (!cinemaFunction || !cinemaFunction.roomId) {
      return [];
    }

    return this.findByIdsInRoom(seatIds, cinemaFunction.roomId, transaction, lock);
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

export default SeatRepository;
