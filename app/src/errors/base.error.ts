// app/src/errors/base.error.ts

/**
 * Clase base universal para todos los errores de dominio de la aplicación.
 * Permite que cualquier módulo (usuarios, carrito, pagos, etc.) exponga
 * su propio código HTTP y código de negocio sin duplicar lógica en el middleware.
 */
export class DomainError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}
