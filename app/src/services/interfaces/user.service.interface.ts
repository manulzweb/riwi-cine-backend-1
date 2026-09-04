// app/src/services/interfaces/user.service.interface.ts

import User from '../../models/user.model.js';
import { UserLocationDto } from '../../dto/request/user-location.dto.js';

/**
 * Contrato del Servicio de Usuarios.
 */

export interface IUserService {
  findAll(): Promise<User[]>;
  updateLocation(dto: UserLocationDto): Promise<void>;
}
