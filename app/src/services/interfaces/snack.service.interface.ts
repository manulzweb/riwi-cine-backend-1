// app/src/services/interfaces/snack.service.interface.ts

import { Snack } from '../../models/snack.model';

/**
 * Interfaz para el Servicio de Confitería
 * --------------------------------------
 * Este archivo define el contrato y los métodos obligatorios que debe implementar
 * el servicio encargado de la gestión de snacks y confitería.
 */
export interface ISnackService {
  
  /**
   * Obtiene todos los productos de confitería, permitiendo un filtro opcional por categoría.
   */
  getAll(category?: string): Promise<Snack[]>;

  /**
   * Valida el inventario y añade un producto de confitería al carrito de compras.
   */
  addToCart(snackId: number, quantity: number): Promise<any>;
}