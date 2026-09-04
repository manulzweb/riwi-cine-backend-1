// app/src/errors/base.error.ts

/**
 * Clase base universal para todos los errores de dominio de la aplicación.
 * Permite que cualquier módulo (usuarios, carrito, pagos, etc.) exponga
 * su propio código HTTP y código de negocio sin duplicar lógica en el middleware.
 *
 * Unifica `AppError` (statusCode) y `CartDomainError` (status) bajo el mismo
 * contrato: `status` + `code` + `isOperational`.
 * Los errores operacionales (4xx) se exponen al cliente; los no operacionales (5xx)
 * se ocultan y se loguean.
 */
export class DomainError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    status: number,
    code: string,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(message, options);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.isOperational = options?.isOperational ?? status < 500;
    // Necesario para que `instanceof` funcione tras transpilar a ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toResponse() {
    return {
      status: this.status,
      error: this.code,
      message: this.message,
    };
  }
}
