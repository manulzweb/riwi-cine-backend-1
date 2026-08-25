import Seat from '../../models/seat.model';

export interface ISeatRepository {
  findByFunctionId(functionId: number): Promise<Seat[]>;

  findByIds(seatIds: number[], functionId: number): Promise<Seat[]>;

  findById(seatId: number): Promise<Seat | null>;
}
