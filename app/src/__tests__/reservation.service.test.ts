// app/src/__tests__/reservation.service.test.ts

import { ReservationService } from '../services/reservation.service.js';
import { IReservationRepository } from '../repositories/interfaces/reservation.repository.interface.js';
import { ISeatRepository } from '../repositories/interfaces/seat.repository.interface.js';
import { IFunctionRepository } from '../repositories/interfaces/function.repository.interface.js';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
} from '../errors/movie.errors.js';
import {
  InvalidReservationIdError,
  InvalidSeatSelectionError,
  SeatLimitExceededError,
  SeatNotAvailableError,
  SeatNotFoundError,
  ReservationNotFoundError,
  UnauthorizedReservationAccessError,
} from '../errors/reservation.errors.js';
import Seat from '../models/seat.model.js';
import CinemaFunction from '../models/function.model.js';
import Reservation from '../models/reservation.model.js';
import ReservationSeat from '../models/reservation-seat.model.js';

jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(async (callback: (t: unknown) => unknown) => await callback({})),
  },
}));

describe('ReservationService (HU-010 / BUG-01 - Selección y Bloqueo de Sillas)', () => {
  let reservationRepo: jest.Mocked<IReservationRepository>;
  let seatRepo: jest.Mocked<ISeatRepository>;
  let functionRepo: jest.Mocked<IFunctionRepository>;
  let service: ReservationService;

  const mockFutureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // En 2 horas

  beforeEach(() => {
    reservationRepo = {
      createReservation: jest.fn(),
      createReservationSeats: jest.fn(),
      findActiveReservationBySeat: jest.fn(),
      findActiveReservationsBySeats: jest.fn(),
      findActiveReservedSeatsByFunction: jest.fn(),
      findById: jest.fn(),
      findByIdWithDetails: jest.fn(),
      findByUserId: jest.fn(),
      releaseReservation: jest.fn(),
      releaseExpiredReservations: jest.fn(),
    };

    seatRepo = {
      findByRoomId: jest.fn(),
      findByIdsInRoom: jest.fn(),
      findByFunctionId: jest.fn(),
      findByIds: jest.fn(),
      findById: jest.fn(),
    };

    functionRepo = {
      findById: jest.fn(),
      findAllByMovie: jest.fn(),
      findByRoomId: jest.fn(),
    };

    service = new ReservationService(reservationRepo, seatRepo, functionRepo);
  });

  describe('lockSeats (RN-039, RN-041, RN-043 / BUG-01)', () => {
    const validFunction = {
      id: 1,
      movieId: 10,
      roomId: 2,
      price: 20000,
      startTime: mockFutureDate,
      isActive: true,
      active: true,
    } as unknown as CinemaFunction;

    const mockSeat1 = {
      id: 101,
      row: 'B',
      number: 4,
      isAvailable: true,
      isActive: true,
      seatType: { name: 'General', priceFactor: 1.0 },
    } as unknown as Seat;

    const mockSeat2 = {
      id: 102,
      row: 'B',
      number: 5,
      isAvailable: true,
      isActive: true,
      seatType: { name: 'VIP', priceFactor: 1.5 },
    } as unknown as Seat;

    it('debe rechazar sillas que ya tienen una reserva activa con status "LOCKED" (BUG-01)', async () => {
      functionRepo.findById.mockResolvedValue(validFunction);
      seatRepo.findByIds.mockResolvedValue([mockSeat1]);

      // Simulamos que la silla 101 ya está bloqueada por otra reserva activa
      reservationRepo.findActiveReservationsBySeats.mockResolvedValue([
        {
          id: 1,
          seatId: 101,
          reservationId: 55,
          status: 'LOCKED',
          price: 20000,
        } as unknown as ReservationSeat,
      ]);

      await expect(service.lockSeats({ userId: 1, functionId: 1, seatIds: [101] })).rejects.toThrow(
        SeatNotAvailableError,
      );

      await expect(service.lockSeats({ userId: 1, functionId: 1, seatIds: [101] })).rejects.toThrow(
        'La silla B4 ya se encuentra reservada o comprada.',
      );

      expect(reservationRepo.createReservation).not.toHaveBeenCalled();
    });

    it('debe rechazar sillas que ya han sido compradas con status "SOLD" (BUG-01)', async () => {
      functionRepo.findById.mockResolvedValue(validFunction);
      seatRepo.findByIds.mockResolvedValue([mockSeat1]);

      // Simulamos que la silla 101 ya fue comprada ('SOLD')
      reservationRepo.findActiveReservationsBySeats.mockResolvedValue([
        {
          id: 2,
          seatId: 101,
          reservationId: 66,
          status: 'SOLD',
          price: 20000,
        } as unknown as ReservationSeat,
      ]);

      await expect(service.lockSeats({ userId: 2, functionId: 1, seatIds: [101] })).rejects.toThrow(
        SeatNotAvailableError,
      );

      await expect(service.lockSeats({ userId: 2, functionId: 1, seatIds: [101] })).rejects.toThrow(
        'La silla B4 ya se encuentra reservada o comprada.',
      );

      expect(reservationRepo.createReservation).not.toHaveBeenCalled();
    });

    it('debe bloquear exitosamente cuando las sillas están disponibles', async () => {
      functionRepo.findById.mockResolvedValue(validFunction);
      seatRepo.findByIds.mockResolvedValue([mockSeat1, mockSeat2]);
      reservationRepo.findActiveReservationsBySeats.mockResolvedValue([]);

      const createdReservation = {
        id: 789,
        userId: 5,
        functionId: 1,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      } as unknown as Reservation;

      reservationRepo.createReservation.mockResolvedValue(createdReservation);
      reservationRepo.createReservationSeats.mockResolvedValue([] as never);

      const result = await service.lockSeats({
        userId: 5,
        functionId: 1,
        seatIds: [101, 102],
      });

      expect(result.reservationId).toBe(789);
      expect(result.functionId).toBe(1);
      expect(result.userId).toBe(5);
      expect(result.totalSeats).toBe(2);
      // General: 20000 * 1.0 = 20000; VIP: 20000 * 1.5 = 30000; Total = 50000
      expect(result.subtotal).toBe(50000);
      expect(result.seats).toHaveLength(2);
      expect(result.seats[0]).toEqual(
        expect.objectContaining({ seatId: 101, row: 'B', number: 4, price: 20000 }),
      );
      expect(result.seats[1]).toEqual(
        expect.objectContaining({ seatId: 102, row: 'B', number: 5, price: 30000 }),
      );

      // Verifica limpieza preventiva de reservas expiradas
      expect(reservationRepo.releaseExpiredReservations).toHaveBeenCalled();
      expect(reservationRepo.createReservation).toHaveBeenCalled();
      expect(reservationRepo.createReservationSeats).toHaveBeenCalled();
    });

    it('lanza InvalidReservationIdError si el userId o functionId son inválidos', async () => {
      await expect(service.lockSeats({ userId: 0, functionId: 1, seatIds: [1] })).rejects.toThrow(
        InvalidReservationIdError,
      );

      await expect(service.lockSeats({ userId: 1, functionId: 0, seatIds: [1] })).rejects.toThrow(
        InvalidReservationIdError,
      );
    });

    it('lanza InvalidSeatSelectionError si la lista de sillas está vacía', async () => {
      await expect(service.lockSeats({ userId: 1, functionId: 1, seatIds: [] })).rejects.toThrow(
        InvalidSeatSelectionError,
      );
    });

    it('lanza SeatLimitExceededError si se intentan bloquear más de 10 sillas', async () => {
      const elevenSeats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      await expect(
        service.lockSeats({ userId: 1, functionId: 1, seatIds: elevenSeats }),
      ).rejects.toThrow(SeatLimitExceededError);
    });

    it('lanza FunctionNotFoundError si la función no existe', async () => {
      functionRepo.findById.mockResolvedValue(null);

      await expect(service.lockSeats({ userId: 1, functionId: 999, seatIds: [1] })).rejects.toThrow(
        FunctionNotFoundError,
      );
    });

    it('lanza FunctionInactiveError si la función está inactiva', async () => {
      functionRepo.findById.mockResolvedValue({
        id: 2,
        isActive: false,
      } as unknown as CinemaFunction);

      await expect(service.lockSeats({ userId: 1, functionId: 2, seatIds: [1] })).rejects.toThrow(
        FunctionInactiveError,
      );
    });

    it('lanza FunctionAlreadyStartedError si la función ya inició en el pasado', async () => {
      functionRepo.findById.mockResolvedValue({
        id: 3,
        isActive: true,
        active: true,
        startTime: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 mins
      } as unknown as CinemaFunction);

      await expect(service.lockSeats({ userId: 1, functionId: 3, seatIds: [1] })).rejects.toThrow(
        FunctionAlreadyStartedError,
      );
    });

    it('lanza SeatNotFoundError si alguna silla no pertenece a la sala/función', async () => {
      functionRepo.findById.mockResolvedValue(validFunction);
      // Se pidieron 2 sillas pero la BD solo encontró 1
      seatRepo.findByIds.mockResolvedValue([mockSeat1]);

      await expect(
        service.lockSeats({ userId: 1, functionId: 1, seatIds: [101, 102] }),
      ).rejects.toThrow(SeatNotFoundError);
    });
  });

  describe('assertSeatsAreAvailable (Validación en lote y detección de sillas no disponibles)', () => {
    it('debe validar en lote llamando a findActiveReservationsBySeats con todos los seatIds', async () => {
      const seats = [
        { id: 201, row: 'C', number: 1, isAvailable: true, isActive: true } as Seat,
        { id: 202, row: 'C', number: 2, isAvailable: true, isActive: true } as Seat,
      ];

      reservationRepo.findActiveReservationsBySeats.mockResolvedValue([]);

      // Invocación directa del método privado helper
      await (
        service as unknown as {
          assertSeatsAreAvailable: (s: Seat[], fnId: number) => Promise<void>;
        }
      ).assertSeatsAreAvailable(seats, 5);

      expect(reservationRepo.findActiveReservationsBySeats).toHaveBeenCalledWith(
        [201, 202],
        5,
        undefined,
      );
    });

    it('debe lanzar SeatNotAvailableError si alguna silla tiene isAvailable en false', async () => {
      const seats = [
        { id: 301, row: 'D', number: 1, isAvailable: true, isActive: true } as Seat,
        { id: 302, row: 'D', number: 2, isAvailable: false, isActive: true } as Seat,
      ];

      await expect(
        (
          service as unknown as {
            assertSeatsAreAvailable: (s: Seat[], fnId: number) => Promise<void>;
          }
        ).assertSeatsAreAvailable(seats, 1),
      ).rejects.toThrow('La silla D2 no se encuentra habilitada.');
    });

    it('debe lanzar SeatNotAvailableError si alguna silla tiene isActive en false', async () => {
      const seats = [{ id: 401, row: 'E', number: 3, isAvailable: true, isActive: false } as Seat];

      await expect(
        (
          service as unknown as {
            assertSeatsAreAvailable: (s: Seat[], fnId: number) => Promise<void>;
          }
        ).assertSeatsAreAvailable(seats, 1),
      ).rejects.toThrow('La silla E3 no se encuentra habilitada.');
    });

    it('debe identificar la silla exacta ocupada cuando existen reservas activas o vendidas', async () => {
      const seats = [
        { id: 501, row: 'F', number: 7, isAvailable: true, isActive: true } as Seat,
        { id: 502, row: 'F', number: 8, isAvailable: true, isActive: true } as Seat,
      ];

      reservationRepo.findActiveReservationsBySeats.mockResolvedValue([
        { seatId: 502, status: 'LOCKED' } as ReservationSeat,
      ]);

      await expect(
        (
          service as unknown as {
            assertSeatsAreAvailable: (s: Seat[], fnId: number) => Promise<void>;
          }
        ).assertSeatsAreAvailable(seats, 1),
      ).rejects.toThrow('La silla F8 ya se encuentra reservada o comprada.');
    });
  });

  describe('releaseSeats (RN-040)', () => {
    it('debe liberar las sillas de una reserva existente perteneciente al usuario', async () => {
      const mockReservation = { id: 10, userId: 3 } as Reservation;
      reservationRepo.findById.mockResolvedValue(mockReservation);
      reservationRepo.releaseReservation.mockResolvedValue();

      await service.releaseSeats({ reservationId: 10, userId: 3 });

      expect(reservationRepo.releaseReservation).toHaveBeenCalledWith(10);
    });

    it('debe lanzar InvalidReservationIdError si reservationId no es válido', async () => {
      await expect(service.releaseSeats(0)).rejects.toThrow(InvalidReservationIdError);
    });

    it('debe lanzar ReservationNotFoundError si la reserva no existe', async () => {
      reservationRepo.findById.mockResolvedValue(null);

      await expect(service.releaseSeats(999)).rejects.toThrow(ReservationNotFoundError);
    });

    it('debe lanzar UnauthorizedReservationAccessError si la reserva no pertenece al usuario', async () => {
      const mockReservation = { id: 20, userId: 5 } as Reservation;
      reservationRepo.findById.mockResolvedValue(mockReservation);

      await expect(service.releaseSeats({ reservationId: 20, userId: 99 })).rejects.toThrow(
        UnauthorizedReservationAccessError,
      );
    });
  });

  describe('getFunctionSeats (Mapa de Sillas HU-010)', () => {
    it('debe retornar mapa de sillas indicando cuáles están disponibles, bloqueadas o deshabilitadas', async () => {
      const validFn = {
        id: 10,
        movieId: 1,
        roomId: 1,
        price: 15000,
        startTime: mockFutureDate,
        isActive: true,
        active: true,
      } as unknown as CinemaFunction;

      functionRepo.findById.mockResolvedValue(validFn);
      reservationRepo.releaseExpiredReservations.mockResolvedValue();

      const seatAvailable = {
        id: 1,
        row: 'A',
        number: 1,
        isActive: true,
        isAvailable: true,
        seatType: { name: 'General', priceFactor: 1.0 },
      } as unknown as Seat;

      const seatLocked = {
        id: 2,
        row: 'A',
        number: 2,
        isActive: true,
        isAvailable: true,
        seatType: { name: 'General', priceFactor: 1.0 },
      } as unknown as Seat;

      const seatDisabled = {
        id: 3,
        row: 'A',
        number: 3,
        isActive: false,
        isAvailable: true,
        seatType: { name: 'General', priceFactor: 1.0 },
      } as unknown as Seat;

      seatRepo.findByFunctionId.mockResolvedValue([seatAvailable, seatLocked, seatDisabled]);
      reservationRepo.findActiveReservedSeatsByFunction.mockResolvedValue([
        { seatId: 2 } as ReservationSeat,
      ]);

      const result = await service.getFunctionSeats(10);

      expect(result.totalSeats).toBe(3);
      expect(result.availableSeats).toBe(1);

      const s1 = result.seats.find((s) => s.id === 1);
      const s2 = result.seats.find((s) => s.id === 2);
      const s3 = result.seats.find((s) => s.id === 3);

      expect(s1?.status).toBe('AVAILABLE');
      expect(s2?.status).toBe('TEMPORARILY_RESERVED');
      expect(s3?.status).toBe('DISABLED');
    });
  });
});
