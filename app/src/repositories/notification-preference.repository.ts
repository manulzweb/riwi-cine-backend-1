// app/src/repositories/notification-preference.repository.ts

import { Transaction } from 'sequelize';
import NotificationPreference, {
  NotificationPreferenceCreationAttributes,
} from '../models/notification-preference.model.js';
import { INotificationPreferenceRepository } from './interfaces/notification-preference.repository.interface.js';

/**
 * Repositorio de Preferencias de Notificación
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad NotificationPreference.
 */
export class NotificationPreferenceRepository implements INotificationPreferenceRepository {
  /**
   * Crea unas nuevas preferencias de notificación.
   */
  async create(
    data: NotificationPreferenceCreationAttributes,
    transaction?: Transaction,
  ): Promise<NotificationPreference> {
    return await NotificationPreference.create(data, { transaction });
  }

  /**
   * Busca las preferencias de notificación de un usuario.
   */
  async findByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<NotificationPreference | null> {
    return await NotificationPreference.findOne({ where: { userId }, transaction });
  }

  /**
   * Actualiza las preferencias de notificación de un usuario.
   */
  async updateByUserId(
    userId: number,
    data: Partial<NotificationPreferenceCreationAttributes>,
    transaction?: Transaction,
  ): Promise<NotificationPreference | null> {
    const prefs = await NotificationPreference.findOne({ where: { userId }, transaction });
    if (!prefs) return null;

    return await prefs.update(data, { transaction });
  }
}

export default NotificationPreferenceRepository;
