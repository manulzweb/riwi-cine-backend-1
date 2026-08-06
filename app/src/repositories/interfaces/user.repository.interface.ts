// app/src/repositories/interfaces/user.repository.interface.ts

import User, { UserCreationAttributes } from '../../models/user.model';
import { Transaction } from 'sequelize';

/**
 * Contrato del Repositorio de Usuarios
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad User.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IUserRepository {
  /**
   * Crea un usuario.
   */
  create(data: UserCreationAttributes, transaction?: Transaction): Promise<User>;

  /**
   * Obtiene todos los usuarios.
   */
  findAll(): Promise<User[]>;

  findByEmail(email: string): Promise<User | null >;

  activate(userId: number): Promise<void>;
}
