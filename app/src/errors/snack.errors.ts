// app/src/errors/snack.errors.ts

import { DomainError } from './base.error.js';

/**
 * ============================================================================
 * Errores de Dominio — Confitería y Promociones (HU-012)
 * ============================================================================
 *
 * Todos los errores extienden de `DomainError` para que el middleware global
 * de errores (`errorHandler`) los traduzca automáticamente a códigos de estado
 * HTTP apropiados y códigos de negocio legibles sin requerir try/catch manuales.
 */

/**
 * Error base para el módulo de confitería.
 */
export class SnackDomainError extends DomainError {
  constructor(
    message: string,
    status: number,
    code: string,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(message, status, code, options);
  }
}

/**
 * Error lanzado cuando el producto de confitería solicitado no existe.
 * HTTP 404 Not Found.
 */
export class SnackNotFoundError extends SnackDomainError {
  constructor(message = 'El producto de confitería solicitado no existe.') {
    super(message, 404, 'SNACK_NOT_FOUND');
  }
}

/**
 * Error lanzado cuando el identificador del producto es inválido.
 * HTTP 400 Bad Request.
 */
export class InvalidSnackIdError extends SnackDomainError {
  constructor(message = 'El ID del producto de confitería es inválido.') {
    super(message, 400, 'INVALID_SNACK_ID');
  }
}

/**
 * Error lanzado cuando la cantidad solicitada no es válida (menor o igual a cero o no entera).
 * HTTP 400 Bad Request.
 */
export class InvalidQuantityError extends SnackDomainError {
  constructor(message = 'La cantidad debe ser un número entero mayor a cero.') {
    super(message, 400, 'INVALID_QUANTITY');
  }
}

/**
 * Error lanzado cuando el producto está agotado o el stock es insuficiente (RN-049).
 * HTTP 400 Bad Request (alineado con la especificación de HU-012).
 */
export class SnackOutOfStockError extends SnackDomainError {
  constructor(
    message = 'Producto agotado o stock insuficiente para satisfacer la solicitud.',
    options?: { cause?: unknown },
  ) {
    super(message, 400, 'SNACK_OUT_OF_STOCK', options);
  }
}

/**
 * Error lanzado cuando el ítem del carrito no existe o no pertenece al usuario.
 * HTTP 400 Bad Request.
 */
export class CartItemNotFoundError extends SnackDomainError {
  constructor(message = 'El ítem del carrito no existe o no pertenece al usuario.') {
    super(message, 400, 'CART_ITEM_NOT_FOUND');
  }
}

/**
 * Error lanzado cuando el ID del ítem de carrito es inválido.
 * HTTP 400 Bad Request.
 */
export class InvalidCartItemIdError extends SnackDomainError {
  constructor(message = 'El ID del ítem de carrito es inválido.') {
    super(message, 400, 'INVALID_CART_ITEM_ID');
  }
}

/**
 * Error lanzado cuando el parámetro userId es obligatorio y no fue provisto.
 * HTTP 400 Bad Request.
 */
export class UserIdRequiredError extends SnackDomainError {
  constructor(message = 'El parámetro userId es obligatorio.') {
    super(message, 400, 'USER_ID_REQUIRED');
  }
}

/**
 * Error lanzado cuando el usuario no existe en la base de datos.
 * HTTP 404 Not Found.
 */
export class UserNotFoundError extends SnackDomainError {
  constructor(message = 'El usuario no existe.') {
    super(message, 404, 'USER_NOT_FOUND');
  }
}

/**
 * Error lanzado cuando el carrito del usuario no existe.
 * HTTP 404 Not Found.
 */
export class UserCartNotFoundError extends SnackDomainError {
  constructor(message = 'El carrito no existe.') {
    super(message, 404, 'CART_NOT_FOUND');
  }
}
