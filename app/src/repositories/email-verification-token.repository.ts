import { Transaction } from 'sequelize';
import EmailVerificationToken, {
  EmailVerificationTokenCreationAttributes,
} from '../models/email-verification-token.model';
import { IEmailVerificationTokenRepository } from './interfaces/email-verification-token.repository.interface';

/**
 * Repositorio encargado de gestionar la persistencia de los
 * tokens de verificación de correo electrónico.
 *
 * Responsabilidades:
 * - Crear tokens de verificación.
 * - Consultar tokens pendientes de utilización.
 * - Marcar tokens como utilizados.
 * - Invalidar tokens anteriores.
 *
 * El Repository únicamente conoce cómo consultar y modificar
 * información en la base de datos mediante Sequelize.
 *
 * La generación y verificación criptográfica de los tokens
 * pertenece a `EmailVerificationTokenService`.
 */
class EmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  /**
   * Crea un nuevo token de verificación en la base de datos.
   *
   * El valor persistido debe ser exclusivamente el hash del token.
   * El token original en texto plano nunca debe almacenarse.
   *
   * @param data Datos necesarios para crear el registro.
   *
   * @returns El registro de token creado.
   */
  async create(
    data: EmailVerificationTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<EmailVerificationToken> {
    return EmailVerificationToken.create(data, { transaction });
  }

  /**
   * Obtiene el token de verificación más reciente que todavía
   * no haya sido utilizado.
   *
   * La búsqueda se ordena por fecha de creación descendente para
   * obtener siempre el token más recientemente generado.
   *
   * @param userId Identificador del usuario.
   *
   * @returns El token más reciente sin utilizar o null si no existe.
   */
  async findLatestUnusedByUserId(userId: number): Promise<EmailVerificationToken | null> {
    return EmailVerificationToken.findOne({
      where: {
        userId,
        usedAt: null,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Marca un token de verificación como utilizado.
   *
   * Se registra la fecha y hora en la que el token fue consumido
   * para impedir su reutilización.
   *
   * @param tokenId Identificador del token.
   */
  async markAsUsed(tokenId: number): Promise<void> {
    await EmailVerificationToken.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          id: tokenId,
        },
      },
    );
  }

  /**
   * Invalida todos los tokens de verificación que todavía
   * no hayan sido utilizados para un usuario.
   *
   * La fecha de utilización se establece para impedir que estos
   * tokens puedan volver a utilizarse.
   *
   * @param userId Identificador del usuario.
   */
  async invalidateUnusedByUserId(userId: number): Promise<void> {
    await EmailVerificationToken.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          userId,
          usedAt: null,
        },
      },
    );
  }
}

/**
 * Instancia única del repositorio de tokens de verificación
 * utilizada por la aplicación.
 *
 * @constant
 * @type {EmailVerificationTokenRepository}
 */
export default new EmailVerificationTokenRepository();
