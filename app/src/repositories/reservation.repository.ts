// app/src/repositories/reservation.repository.ts

import { Op, Transaction } from 'sequelize';
import { IReservationRepository } from './interfaces/reservation.repository.interface.js';
import Reservation from '../models/reservation.model.js';
import ReservationSeat from '../models/reservation-seat.model.js';

class ReservationRepository implements IReservationRepository {
  async createReservation(
    userId: number,
    functionId: number,
    expiresAt: Date,
    transaction?: Transaction,
  ): Promise<Reservation> {
    return await Reservation.create(
      {
        userId,
        functionId,
        status: 'ACTIVE',
        expiresAt,
      },
      {
        transaction,
      },
    );
  }

  async createReservationSeats(
    reservationId: number,
    seats: {
      seatId: number;
      price: number;
    }[],
    transaction?: Transaction,
  ): Promise<ReservationSeat[]> {
    const reservationSeats = seats.map((seat) => ({
      reservationId,
      seatId: seat.seatId,
      price: seat.price,
      status: 'LOCKED' as const,
    }));

    return await ReservationSeat.bulkCreate(reservationSeats, {
      transaction,
    });
  }

  async findActiveReservationBySeat(
    seatId: number,
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat | null> {
    return await ReservationSeat.findOne({
      where: {
        seatId,
        status: 'LOCKED',
      },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          where: {
            functionId,
            status: 'ACTIVE',
            expiresAt: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      transaction,
    });
  }

  async findById(reservationId: number, transaction?: Transaction): Promise<Reservation | null> {
    return await Reservation.findByPk(reservationId, {
      include: [
        {
          model: ReservationSeat,
          as: 'reservationSeats',
        },
      ],
      transaction,
    });
  }

  async findByUserId(
    reservationId: number,
    userId: number,
    transaction?: Transaction,
  ): Promise<Reservation | null> {
    return await Reservation.findOne({
      where: {
        id: reservationId,
        userId,
      },
      include: [
        {
          model: ReservationSeat,
          as: 'reservationSeats',
        },
      ],
      transaction,
    });
  }

  async releaseReservation(reservationId: number, transaction?: Transaction): Promise<void> {
    await ReservationSeat.update(
      {
        status: 'RELEASED',
      },
      {
        where: {
          reservationId,
          status: 'LOCKED',
        },
        transaction,
      },
    );

    await Reservation.update(
      {
        status: 'RELEASED',
      },
      {
        where: {
          id: reservationId,
        },
        transaction,
      },
    );
  }

  async releaseExpiredReservations(transaction?: Transaction): Promise<void> {
    const now = new Date();

    const expiredReservations = await Reservation.findAll({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          [Op.lte]: now,
        },
      },
      transaction,
    });

    for (const reservation of expiredReservations) {
      await this.releaseReservation(reservation.id, transaction);
    }
  }
}

export default new ReservationRepository();
