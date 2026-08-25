// app/src/repositories/promotion.repository.ts

import { Op } from 'sequelize';
import { Promotion } from '../models/promotion.model';
import { IPromotionRepository } from './interfaces/promotion.repository.interface';

/**
 * Repositorio de Promociones
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Promotion.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class PromotionRepository implements IPromotionRepository {
  /**
   * Busca la promoción activa más reciente para un producto de confitería.
   *
   * Valida que la promoción:
   *  - Esté activa (`isActive = true`).
   *  - Esté dentro de su rango de fechas (`startDate <= now <= endDate`).
   *
   * Se ordena por `endDate DESC` para retornar la promoción con la fecha
   * de finalización más cercana (la más reciente).
   *
   * Retorna `null` cuando no existe una promoción vigente para el producto.
   */
  async findActiveBySnackId(snackId: number): Promise<Promotion | null> {
    const now = new Date();

    return await Promotion.findOne({
      where: {
        snackId,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      order: [['endDate', 'DESC']],
    });
  }
}

export default new PromotionRepository();
