// app/src/services/snack.service.ts

import { Snack } from '../models/snack.model';
import { ISnackService } from './interfaces/snack.service.interface'; // <-- Importamos tu nueva interfaz

/**
 * Servicio de Confitería
 * ---------------------
 * Implementa el contrato `ISnackService` para asegurar la consistencia arquitectónica del proyecto.
 */
export class SnackService implements ISnackService {
  
  /**
   * Consulta la base de datos para retornar los productos de confitería.
   */
  async getAll(category?: string): Promise<Snack[]> {
    const whereCondition = category ? { category } : {};
    
    return await Snack.findAll({
      where: whereCondition,
      order: [['name', 'ASC']],
    });
  }

  /**
   * Ejecuta la validación de inventario (Regla de Negocio RN-049).
   */
  async addToCart(snackId: number, quantity: number): Promise<any> {
    const snack = await Snack.findByPk(snackId);

    if (!snack) {
      throw new Error('El producto de confitería solicitado no existe.');
    }

    if (snack.stock < quantity || snack.stock === 0) {
      throw new Error(`Producto agotado o stock insuficiente. Unidades disponibles en tienda: ${snack.stock}`);
    }

    return {
      snackId: snack.id,
      name: snack.name,
      quantityRequested: quantity,
      priceUnit: snack.price,
      subtotal: snack.price * quantity
    };
  }
}
