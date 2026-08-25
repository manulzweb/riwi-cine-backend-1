// app/src/repositories/interfaces/reservation.repository.interface.ts

import { Transaction } from 'sequelize';
import Reservation from '../../models/reservation.model';
import ReservationSeat from '../../models/reservation-seat.model';

export interface IReservationRepository {
  createReservation(
    userId: number,
    functionId: number,
    expiresAt: Date,
    transaction?: Transaction,
  ): Promise<Reservation>;

  createReservationSeats(
    reservationId: number,
    seats: {
      seatId: number;
      price: number;
    }[],
    transaction?: Transaction,
  ): Promise<ReservationSeat[]>;

  findActiveReservationBySeat(
    seatId: number,
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat | null>;

  findById(reservationId: number, transaction?: Transaction): Promise<Reservation | null>;

  findByUserId(
    reservationId: number,
    userId: number,
    transaction?: Transaction,
  ): Promise<Reservation | null>;

  releaseReservation(reservationId: number, transaction?: Transaction): Promise<void>;

  releaseExpiredReservations(transaction?: Transaction): Promise<void>;
}
