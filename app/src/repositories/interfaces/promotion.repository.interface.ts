// app/src/repositories/interfaces/promotion.repository.interface.ts

import { Promotion } from '../../models/promotion.model.js';

/**
 * Contrato del Repositorio de Promociones.
 *
 * Define la capa de persistencia para la entidad `Promotion`. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface IPromotionRepository {
  /**
   * Busca la promoción activa más favorable o más reciente para un producto de confitería.
   *
   * Valida que la promoción esté activa y dentro de su rango de vigencia.
   */
  findActiveBySnackId(snackId: number, now?: Date): Promise<Promotion | null>;

  /**
   * Obtiene todas las promociones activas y vigentes.
   */
  findAllActive(now?: Date): Promise<Promotion[]>;
}
