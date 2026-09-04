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
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
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
  async findByUserId(userId: number): Promise<NotificationPreference | null> {
    return await NotificationPreference.findOne({ where: { userId } });
  }
}

export default NotificationPreferenceRepository;
