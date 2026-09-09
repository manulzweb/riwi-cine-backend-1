// app/src/repositories/user.repository.ts

import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../models/user.model.js';
import { IUserRepository } from './interfaces/user.repository.interface.js';
import { envConfig } from '../config/env.js';

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
   * Obtiene todos los usuarios excluyendo passwordHash.
   */
  async findAll(): Promise<User[]> {
    return await User.findAll({
      attributes: { exclude: ['passwordHash'] },
    });
  }

  /**
   * Busca un usuario por su correo.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Activa la cuenta de un usuario registrando la fecha de activación.
   *
   * @param userId Identificador del usuario.
   * @param transaction Transacción opcional para Unit of Work.
   */
  async activate(userId: number, transaction?: Transaction): Promise<void> {
    await User.update(
      { isActive: true, activatedAt: new Date() },
      { where: { id: userId }, transaction },
    );
  }

  /**
   * Busca un usuario por su identificador.
   */
  async findById(id: number): Promise<User | null> {
    return await User.findOne({ where: { id } });
  }

  /**
   * Incrementa el contador de intentos fallidos de inicio de sesión.
   *
   * Si el usuario alcanza el máximo de intentos permitidos, bloquea
   * la cuenta hasta la fecha calculada según el tiempo de bloqueo
   * configurado.
   */
  async incrementFailedAttempts(id: number): Promise<User | void> {
    const max = envConfig.LOGIN.MAX_ATTEMPTS;
    const minutes = envConfig.LOGIN.LOCK_TIME_MINUTES;

    const user = await User.findByPk(id);
    if (!user) return;

    // Si la cuenta tuvo un bloqueo anterior y ya expiró el tiempo, se reinicia el conteo
    const isLockExpired = user.lockedUntil && user.lockedUntil <= new Date();
    const currentAttempts = isLockExpired ? 0 : (user.failedLoginAttempts ?? 0);
    const attempts = currentAttempts + 1;

    await user.update({
      failedLoginAttempts: attempts,
      lockedUntil:
        attempts >= max
          ? new Date(Date.now() + minutes * 60_000)
          : isLockExpired
            ? null
            : user.lockedUntil,
    });
  }
  /**
   * Reinicia el contador de intentos fallidos y el bloqueo del usuario,
   * registrando la fecha del último inicio de sesión exitoso.
   */
  async resetFailedAttempts(id: number): Promise<void> {
    await User.update(
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
      {
        where: { id: id },
      },
    );
  }

  /**
   * Actualiza el hash de la contraseña del usuario.
   *
   * @param id Identificador del usuario.
   * @param passwordHash Hash bcrypt de la nueva contraseña.
   * @param transaction Transacción opcional para Unit of Work.
   */
  async updatePassword(id: number, passwordHash: string, transaction?: Transaction): Promise<void> {
    await User.update({ passwordHash }, { where: { id }, transaction });
  }
}

export default UserRepository;
