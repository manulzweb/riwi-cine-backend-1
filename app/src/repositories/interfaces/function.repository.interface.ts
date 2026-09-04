// app/src/repositories/interfaces/function.repository.interface.ts

import CinemaFunction from '../../models/function.model.js';
import { FunctionFiltersDto } from '../../dto/function-detail.dto.js';

export interface IFunctionRepository {
  findById(id: number): Promise<CinemaFunction | null>;
  findAllByMovie(movieId: number, filters?: FunctionFiltersDto): Promise<CinemaFunction[]>;
  findByRoomId(roomId: number): Promise<CinemaFunction[]>;
}
