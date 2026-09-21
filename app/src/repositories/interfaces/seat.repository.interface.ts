import { Transaction } from 'sequelize';
import Seat from '../../models/seat.model.js';

export interface ISeatRepository {
  findByRoomId(roomId: number): Promise<Seat[]>;
  findByIdsInRoom(
    seatIds: number[],
    roomId: number,
    transaction?: Transaction,
    lock?: boolean,
  ): Promise<Seat[]>;
  findByFunctionId(functionId: number): Promise<Seat[]>;
  findByIds(
    seatIds: number[],
    functionId: number,
    transaction?: Transaction,
    lock?: boolean,
  ): Promise<Seat[]>;
  findById(seatId: number): Promise<Seat | null>;
}
