// app/src/repositories/reservation.repository.ts

import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database.js';
import { IReservationRepository } from './interfaces/reservation.repository.interface.js';
import Reservation from '../models/reservation.model.js';
import ReservationSeat from '../models/reservation-seat.model.js';
import Seat from '../models/seat.model.js';
import SeatType from '../models/seat-type.model.js';
import CinemaFunction from '../models/function.model.js';
import Movie from '../models/movie.model.js';

export class ReservationRepository implements IReservationRepository {
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
    const seats = await this.findActiveReservationsBySeats([seatId], functionId, transaction);
    return seats[0] ?? null;
  }

  async findActiveReservationsBySeats(
    seatIds: number[],
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat[]> {
    if (seatIds.length === 0) {
      return [];
    }

    const now = new Date();
    return await ReservationSeat.findAll({
      where: {
        seatId: {
          [Op.in]: seatIds,
        },
        [Op.or]: [
          { status: 'SOLD' },
          {
            status: 'LOCKED',
            [Op.and]: [
              sequelize.where(sequelize.col('reservation.status'), 'ACTIVE'),
              sequelize.where(sequelize.col('reservation.expires_at'), {
                [Op.gt]: now,
              }),
            ],
          },
        ],
      },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          where: {
            functionId,
          },
        },
      ],
      transaction,
    });
  }

  async findActiveReservedSeatsByFunction(
    functionId: number,
    transaction?: Transaction,
  ): Promise<ReservationSeat[]> {
    const now = new Date();
    return await ReservationSeat.findAll({
      where: {
        [Op.or]: [
          { status: 'SOLD' },
          {
            status: 'LOCKED',
            [Op.and]: [
              sequelize.where(sequelize.col('reservation.status'), 'ACTIVE'),
              sequelize.where(sequelize.col('reservation.expires_at'), {
                [Op.gt]: now,
              }),
            ],
          },
        ],
      },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          where: {
            functionId,
          },
        },
      ],
      transaction,
      lock: transaction ? Transaction.LOCK.UPDATE : undefined,
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

  async findByIdWithDetails(
    reservationId: number,
    transaction?: Transaction,
  ): Promise<Reservation | null> {
    return await Reservation.findByPk(reservationId, {
      include: [
        {
          model: ReservationSeat,
          as: 'reservationSeats',
          include: [
            {
              model: Seat,
              as: 'seat',
              include: [
                {
                  model: SeatType,
                  as: 'seatType',
                },
              ],
            },
          ],
        },
        {
          model: CinemaFunction,
          as: 'function',
          include: [
            {
              model: Movie,
              as: 'movie',
            },
          ],
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

export default ReservationRepository;
