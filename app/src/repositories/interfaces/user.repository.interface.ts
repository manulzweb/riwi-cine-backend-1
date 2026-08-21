// app/src/repositories/interfaces/user.repository.interface.ts

import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../../models/user.model';

/**
 * Contrato del Repositorio de Usuarios.
 *
 * Define la capa de persistencia para la entidad User. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface IUserRepository {
  /**
   * Crea un usuario.
   */
  create(data: UserCreationAttributes, transaction?: Transaction): Promise<User>;

  /**
   * Obtiene todos los usuarios activos/inactivos según la regla de negocio.
   */
  findAll(): Promise<User[]>;

  /**
   * Activa la cuenta del usuario.
   */
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
   * Incrementa los intentos fallidos de login y puede bloquear la cuenta.
   */
  incrementFailedAttempts(userId: number): Promise<User | void>;

  /**
   * Reinicia la cantidad de intentos fallidos y actualiza el último login.
   */
  resetFailedAttempts(userId: number): Promise<void>;

  /**
   * Actualiza el hash de la contraseña del usuario.
   */
  updatePassword(userId: number, passwordHash: string): Promise<void>;
}
