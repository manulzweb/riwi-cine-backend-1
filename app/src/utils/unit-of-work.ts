// app/src/utils/unit-of-work.ts

import { Transaction } from 'sequelize';
import sequelize from '../config/database';

/**
 * ============================================================================
 * Unit of Work — Gestión de Transacciones
 * ============================================================================
 *
 * Centraliza la creación y el control de transacciones Sequelize para
 * garantizar atomicidad entre múltiples operaciones de escritura.
 *
 * Responsabilidades:
 *  - Abrir una transacción con el nivel de aislamiento solicitado.
 *  - Ejecutar el trabajo (`work`) dentro de la transacción.
 *  - Confirmar (commit) si todo es exitoso o revertir (rollback) si falla.
 *  - Reintentar automáticamente ante fallos de serialización (40001)
 *    cuando se usa `SERIALIZABLE`.
 *
 * Este util NO debe:
 *  - Conocer entidades del dominio (User, Membership, etc.).
 *  - Contener reglas de negocio.
 *  - Realizar validaciones.
 *
 * Arquitectura:
 *  Service → unitOfWork.run(work, options) → sequelize.transaction → Repository
 *
 * @example
 *  await unitOfWork.run(async (tx) => {
 *    await userRepository.create(data, tx)
 *    await profileRepository.create(data, tx)
 *  }, { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED })
 * ============================================================================
 */

export interface UnitOfWorkOptions {
  /** Nivel de aislamiento Sequelize. Por defecto READ_COMMITTED. */
  isolationLevel?: Transaction.ISOLATION_LEVELS;
  /** Reintenta si Postgres lanza 40001 (serialization_failure). Solo con SERIALIZABLE. */
  retryOnSerializationFailure?: boolean;
  /** Máximo de reintentos. Por defecto 3. */
  maxRetries?: number;
}

/**
 * Determina si el error corresponde a un fallo de serialización de Postgres.
 */
const isSerializationFailure = (error: unknown): boolean => {
  const e = error as { original?: { code?: string }; parent?: { code?: string }; code?: string };
  return e?.original?.code === '40001' || e?.parent?.code === '40001' || e?.code === '40001';
};

/**
 * Ejecuta `work` dentro de una transacción Sequelize.
 *
 * @param work Función que recibe la transacción y ejecuta las operaciones.
 * @param options Opciones de aislamiento y reintentos.
 * @returns Resultado de `work` si la transacción confirma.
 */
export const runInTransaction = async <T>(
  work: (transaction: Transaction) => Promise<T>,
  options: UnitOfWorkOptions = {},
): Promise<T> => {
  const {
    isolationLevel = Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    retryOnSerializationFailure = false,
    maxRetries = 3,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await sequelize.transaction({ isolationLevel }, work);
    } catch (error) {
      lastError = error;
      if (
        !retryOnSerializationFailure ||
        !isSerializationFailure(error) ||
        attempt === maxRetries
      ) {
        throw error;
      }
      // Reintento silencioso ante 40001
    }
  }

  throw lastError;
};

/**
 * Objeto de conveniencia para inyección y testeo.
 */
export const unitOfWork = {
  run: runInTransaction,
};

export default unitOfWork;
