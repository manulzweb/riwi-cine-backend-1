import { Promotion } from '../../models/promotion.model';

/**
 * Contrato del Repositorio de Promociones.
 *
 * Define la capa de persistencia para la entidad Promotion. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface IPromotionRepository {
  /**
   * Busca la promoción activa más reciente para un producto de confitería.
   *
   * Valida que la promoción esté activa y dentro de su rango de fechas.
   */
  findActiveBySnackId(snackId: number): Promise<Promotion | null>;
}
