// app/src/errors/cart.errors.ts

/**
 * Errores de dominio del carrito de compras (HU-011).
 *
 * Permiten que la capa de servicios comunique situaciones de negocio
 * (RN-044 a RN-048) sin acoplarse a códigos HTTP literales, y que la
 * capa de controladores los traduzca a las respuestas HTTP apropiadas.
 *
 * Cada error expone `status` (código HTTP sugerido) y `code` (identificador
 * estable para el cliente), de modo que el controlador no dependa del texto.
 */

/**
 * Clase base para los errores de dominio del carrito.
 *
 * Las subclases definen un mensaje, código HTTP y código de negocio por
 * defecto, pero permiten sobrescribir el mensaje cuando es dinámico
 * (por ejemplo, incluye el nombre del producto o el saldo disponible).
 */
export class CartDomainError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}

/** No hay un carrito activo para el usuario. Traducir a HTTP 404. */
export class CartNotFoundError extends CartDomainError {
  constructor(
    message = 'No existe un carrito activo para este usuario.',
    options?: { cause?: unknown },
  ) {
    super(message, 404, 'CART_NOT_FOUND', options);
  }
}

/** El carrito activo venció y debe iniciarse una nueva compra. HTTP 410. */
export class CartExpiredError extends CartDomainError {
  constructor(
    message = 'El carrito ha expirado. Debes iniciar una nueva compra.',
    options?: { cause?: unknown },
  ) {
    super(message, 410, 'CART_EXPIRED', options);
  }
}

/** Ya existe un carrito activo para el usuario. HTTP 409 (Conflict). */
export class DuplicateCartError extends CartDomainError {
  constructor(
    message = 'Ya existe un carrito activo para este usuario.',
    options?: { cause?: unknown },
  ) {
    super(message, 409, 'DUPLICATE_CART', options);
  }
}

/** El producto de confitería solicitado no existe. HTTP 404. */
export class SnackNotFoundError extends CartDomainError {
  constructor(message = 'El producto de confitería no existe.', options?: { cause?: unknown }) {
    super(message, 404, 'SNACK_NOT_FOUND', options);
  }
}

/** El producto de confitería está agotado de forma global. HTTP 409. */
export class OutOfStockError extends CartDomainError {
  constructor(message = 'El producto de confitería está agotado.', options?: { cause?: unknown }) {
    super(message, 409, 'OUT_OF_STOCK', options);
  }
}

/** La cantidad solicitada excede el stock disponible. HTTP 422. */
export class InsufficientStockError extends CartDomainError {
  constructor(message = 'Stock insuficiente para el producto.', options?: { cause?: unknown }) {
    super(message, 422, 'INSUFFICIENT_STOCK', options);
  }
}

/** Se envió una cantidad negativa en el carrito. HTTP 422. */
export class NegativeQuantityError extends CartDomainError {
  constructor(message = 'No se permiten cantidades negativas.', options?: { cause?: unknown }) {
    super(message, 422, 'NEGATIVE_QUANTITY', options);
  }
}

/** La entrada indicada no pertenece al carrito activo. HTTP 404. */
export class TicketNotBelongsError extends CartDomainError {
  constructor(
    message = 'La entrada indicada no pertenece al carrito activo.',
    options?: { cause?: unknown },
  ) {
    super(message, 404, 'TICKET_NOT_BELONGS', options);
  }
}

/** El monto del bono/giftcard no es válido (<= 0). HTTP 422. */
export class InvalidAmountError extends CartDomainError {
  constructor(message = 'El monto del bono debe ser mayor a cero.', options?: { cause?: unknown }) {
    super(message, 422, 'INVALID_AMOUNT', options);
  }
}

/** El usuario no posee una billetera de bonos. HTTP 404. */
export class WalletNotFoundError extends CartDomainError {
  constructor(
    message = 'El usuario no posee una billetera de bonos.',
    options?: { cause?: unknown },
  ) {
    super(message, 404, 'WALLET_NOT_FOUND', options);
  }
}

/** El saldo de bonos es insuficiente. HTTP 422. */
export class InsufficientBalanceError extends CartDomainError {
  constructor(message = 'Saldo de bonos insuficiente.', options?: { cause?: unknown }) {
    super(message, 422, 'INSUFFICIENT_BALANCE', options);
  }
}
