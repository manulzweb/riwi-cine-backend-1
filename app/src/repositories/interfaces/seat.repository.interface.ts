// app/src/repositories/interfaces/seat.repository.interface.ts

import Seat from '../../models/seat.model.js';

export interface ISeatRepository {
  findByFunctionId(functionId: number): Promise<Seat[]>;

  findByIds(seatIds: number[], functionId: number): Promise<Seat[]>;

  findById(seatId: number): Promise<Seat | null>;
}
