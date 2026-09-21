// app/src/repositories/interfaces/reservation.repository.interface.ts

import { Transaction } from 'sequelize';
import Reservation from '../../models/reservation.model.js';
import ReservationSeat from '../../models/reservation-seat.model.js';

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

  findActiveReservationsBySeats(
    seatIds: number[],
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat[]>;

  findActiveReservedSeatsByFunction(
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat[]>;

  findById(reservationId: number, transaction?: Transaction): Promise<Reservation | null>;

  findByIdWithDetails(
    reservationId: number,
    transaction?: Transaction,
  ): Promise<Reservation | null>;

  findByUserId(
    reservationId: number,
    userId: number,
    transaction?: Transaction,
  ): Promise<Reservation | null>;

  releaseReservation(reservationId: number, transaction?: Transaction): Promise<void>;

  releaseExpiredReservations(transaction?: Transaction): Promise<void>;
}
