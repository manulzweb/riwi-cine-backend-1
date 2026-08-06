// app/src/repositories/user.repository.ts

import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../models/user.model';
import { IUserRepository } from './interfaces/user.repository.interface';

/**
 * Repositorio de Usuarios
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad User.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class UserRepository implements IUserRepository {
  /**
   * Crea un nuevo usuario.
   */
  async create(data: UserCreationAttributes, transaction?: Transaction): Promise<User> {
    return await User.create(data, { transaction });
  }

  /**
   * Obtiene todos los usuarios.
   */
  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  /**
   * Busca un usuario por su correo.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async activate(userId: number): Promise<void> {
    await User.update({isActive: true, activatedAt: new Date()}, {where: {id: userId}});
  }
}

export default new UserRepository();
