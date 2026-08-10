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
  create(data: UserCreationAttributes): Promise<User>;

  /**
   * Obtiene todos los usuarios.
   */
  findAll(): Promise<User[]>;


  activate(userId: number): Promise<void>;
  /**
   * Obtiene un usuario por su ID.
   */
  findById(id: number): Promise<User | null>;

  /**
   * Obtiene un usuario por el email.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   *  Incrementa el contador de fallos y bloquea al llegar al maximo
   */
  incrementFailedAttempts(userId: number): Promise<User | void>;

  /**
   * Limpia el contador, libera el bloqueo y registra el last_login_at
   */
  resetFailedAttempts(userId: number): Promise<void>;
}
