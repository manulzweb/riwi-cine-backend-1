// app/src/containers/reservation.container.ts

import { ReservationController } from '../controllers/reservation.controller.js';
import ReservationRepository from '../repositories/reservation.repository.js';
import SeatRepository from '../repositories/seat.repository.js';
import FunctionRepository from '../repositories/function.repository.js';
import ReservationService from '../services/reservation.service.js';

const reservationRepository = new ReservationRepository();
const seatRepository = new SeatRepository();
const functionRepository = new FunctionRepository();

export const reservationService = new ReservationService(
  reservationRepository,
  seatRepository,
  functionRepository,
);

export const reservationController = new ReservationController(reservationService);
