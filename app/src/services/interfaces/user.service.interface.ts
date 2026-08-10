// app/src/services/interfaces/user.service.interface.ts

import User from '../../models/user.model';
import { UserLocationDto } from '../../dto/user-location.dto';

/**
 * Contrato del Servicio de Usuarios.
 */

export interface IUserService {
  findAll(): Promise<User[]>;
  updateLocation(dto: UserLocationDto): Promise<void>;
}
