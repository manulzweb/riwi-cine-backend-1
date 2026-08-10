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
  async findById(id: number): Promise<User | null> {
    return await User.findOne({ where: { id } });
  }

  async incrementFailedAttempts(id: number): Promise<User | void> {
    const max = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
    const minutes = Number(process.env.LOCK_TIME_MINUTES || 15);

    const user = await User.findByPk(id);
    if (!user) return;

    const attempts = (user.failed_login_attempts ?? 0) + 1;
    await user.update({
      failed_login_attempts: attempts,
      locked_until: attempts >= max ? new Date(Date.now() + minutes * 60_000) : user.locked_until,
    });
  }
  async resetFailedAttempts(id: number): Promise<void> {
    await User.update(
      {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
      },
      {
        where: { id: id },
      },
    );
  }
}

export default new UserRepository();
