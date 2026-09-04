// app/src/dto/request/update-cart.dto.ts

/**
 * DTO de entrada para la modificación del carrito de compras.
 *
 * Permite actualizar cantidades de confitería y quitar entradas antes del
 * pago (HU-011). Ambas listas son opcionales e independientes.
 *
 * Reglas de validación aplicadas en el servicio:
 *  - `quantity` debe ser un entero mayor o igual a cero (no se permiten
 *    cantidades negativas). Con `0` el producto se retira del carrito.
 *  - No se permite superar el stock disponible del producto.
 *  - Los tickets a eliminar deben pertenecer al carrito activo del usuario.
 *
 * @property {Array<{snackId: number; quantity: number}>} [snacks] - Cantidades de confitería a fijar.
 * @property {number[]} [removeTicketIds] - Identificadores de entradas a quitar.
 *
 * @example
 * const dto: UpdateCartRequestDto = {
 *   snacks: [{ snackId: 3, quantity: 2 }],
 *   removeTicketIds: [7],
 * };
 */
export interface UpdateCartSnackDto {
  snackId: number;
  quantity: number;
}

export interface UpdateCartRequestDto {
  snacks?: UpdateCartSnackDto[];
  removeTicketIds?: number[];
}
