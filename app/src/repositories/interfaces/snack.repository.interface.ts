import { Snack } from '../../models/snack.model';

/**
 * Contrato del Repositorio de Confitería.
 *
 * Define la capa de persistencia para la entidad Snack. El repositorio
 * encapsula la lógica de consulta y escritura contra Sequelize y no contiene
 * validaciones de negocio.
 */
export interface ISnackRepository {
  /**
   * Obtiene todos los productos de confitería, con filtro opcional por categoría.
   */
  findAll(category?: string): Promise<Snack[]>;

  /**
   * Busca un producto de confitería por su identificador.
   */
  findById(id: number): Promise<Snack | null>;
}
