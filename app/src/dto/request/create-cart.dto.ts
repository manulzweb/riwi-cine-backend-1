/**
 * DTO de entrada para la creación del carrito de compras.
 *
 * Representa los datos que el cliente envía a la API al seleccionar sillas
 * y continuar hacia el carrito (HU-011).
 *
 * @property {number} functionId - Identificador de la función (película, sala, horario).
 * @property {number[]} seatIds - Identificadores de las sillas seleccionadas.
 *
 * @example
 * const dto: CreateCartRequestDto = {
 *   functionId: 12,
 *   seatIds: [101, 102],
 * };
 */
export interface CreateCartRequestDto {
  functionId: number;
  seatIds: number[];
}
