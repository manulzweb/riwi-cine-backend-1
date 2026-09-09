// app/src/repositories/snack.repository.ts

import { Snack } from '../models/snack.model.js';
import { ISnackRepository } from './interfaces/snack.repository.interface.js';

/**
 * Repositorio de Confitería
 * -------------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad `Snack`.
 *
 * Esta clase es la única responsable de interactuar con Sequelize para
 * el catálogo de confitería.
 */
class SnackRepository implements ISnackRepository {
  /**
   * Obtiene todos los productos de confitería.
   *
   * Cuando se proporciona una categoría, filtra únicamente los productos
   * que pertenecen a dicha categoría. Los resultados se ordenan
   * alfabéticamente por nombre.
   */
  async findAll(category?: string): Promise<Snack[]> {
    const whereCondition = category ? { category } : {};

    return await Snack.findAll({
      where: whereCondition,
      order: [['name', 'ASC']],
    });
  }

  /**
   * Busca un producto de confitería por su identificador.
   *
   * Retorna `null` cuando no existe un producto con el id proporcionado.
   */
  async findById(id: number): Promise<Snack | null> {
    return await Snack.findByPk(id);
  }

  /**
   * Obtiene todas las categorías de confitería disponibles sin duplicados.
   */
  async findAllCategories(): Promise<string[]> {
    const rows = await Snack.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
      raw: true,
    });

    return rows.map((r: { category: string }) => r.category).filter(Boolean);
  }
}

export default SnackRepository;
