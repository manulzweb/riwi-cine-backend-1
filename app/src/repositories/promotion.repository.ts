// app/src/repositories/promotion.repository.ts

import { Op } from 'sequelize';
import { Promotion } from '../models/promotion.model.js';
import { IPromotionRepository } from './interfaces/promotion.repository.interface.js';

/**
 * Repositorio de Promociones
 * --------------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad `Promotion`.
 *
 * Esta clase es la única responsable de interactuar con Sequelize para
 * las promociones de productos de confitería.
 */
class PromotionRepository implements IPromotionRepository {
  /**
   * Busca la promoción activa más reciente y vigente para un producto de confitería.
   *
   * Valida que la promoción:
   *  - Esté activa (`isActive = true`).
   *  - Esté dentro de su rango de vigencia (`startDate <= now <= endDate`).
   *
   * Se ordena por `endDate DESC` para retornar la promoción con la fecha
   * de finalización más cercana (la más reciente).
   */
  async findActiveBySnackId(snackId: number, now: Date = new Date()): Promise<Promotion | null> {
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

  /**
   * Obtiene todas las promociones activas y vigentes.
   */
  async findAllActive(now: Date = new Date()): Promise<Promotion[]> {
    return await Promotion.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      order: [['startDate', 'DESC']],
    });
  }
}

export default PromotionRepository;
