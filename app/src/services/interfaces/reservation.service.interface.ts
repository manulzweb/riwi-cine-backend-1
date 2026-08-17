import { LockSeatsDto } from '../../dto/lock-seats.dto';
import { ReleaseSeatsDto } from '../../dto/release-seats.dto';

export interface IReservationService {
  /**
   * Obtiene el mapa de sillas de una función.
   */
  getFunctionSeats(functionId: number): Promise<unknown>;

  /**
   * Bloquea temporalmente las sillas seleccionadas.
   */
  lockSeats(dto: LockSeatsDto): Promise<unknown>;

  /**
   * Libera las sillas de una reserva.
   */
  releaseSeats(dto: ReleaseSeatsDto): Promise<void>;

  /**
   * Obtiene el resumen de una reserva.
   */
  getReservationSummary(reservationId: number, userId: number): Promise<unknown>;
}
