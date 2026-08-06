// app/src/services/interfaces/user.service.interface.ts

import User from '../../models/user.model';

/**
 * Contrato del Servicio de Usuarios.
 */

export interface IUserService {
  findAll(): Promise<User[]>;
}
