// app/src/repositories/interfaces/notification-preference.repository.interface.ts

/**
 * Contrato del repositorio de preferencias de notificación.
 *
 * Define las operaciones de persistencia para la entidad NotificationPreference.
 */
import NotificationPreference, {
  NotificationPreferenceCreationAttributes,
} from '../../models/notification-preference.model.js';

export interface INotificationPreferenceRepository {
  /** Crea la preferencia de notificación del usuario. */
  create(data: NotificationPreferenceCreationAttributes): Promise<NotificationPreference>;

  /** Busca la preferencia asociada a un usuario. */
  findByUserId(userId: number): Promise<NotificationPreference | null>;
}
