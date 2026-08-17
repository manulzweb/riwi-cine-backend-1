// app/src/__tests__/services/function.service.test.ts

import functionService from '../../services/function.service';
import repository from '../../repositories/function.repository';
import CinemaFunction from '../../models/function.model';

jest.mock('../../repositories/function.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const inTwoDays = new Date();
inTwoDays.setDate(inTwoDays.getDate() + 2);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

interface FunctionOverrides {
  dateTime?: Date;
  active?: boolean;
  availableSeats?: number;
}

const buildFunction = (overrides: FunctionOverrides = {}): CinemaFunction => {
  const base = {
    id: 1,
    movieId: 10,
    dateTime: inTwoDays,
    format: '3D',
    room: 'Sala IMAX',
    price: 22000,
    totalSeats: 100,
    availableSeats: 40,
    active: true,
    movie: { id: 10, title: 'Guardianes del Tiempo' },
    ...overrides,
  };
  return base as unknown as CinemaFunction;
};

describe('FunctionService · HU-009 Selección de Función y Formato', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFunctionById', () => {
    it('lanza 404 si la función no existe', async () => {
      mockedRepository.findById.mockResolvedValue(null);

      await expect(functionService.getFunctionById(999)).rejects.toThrow(
        'No se encontró la función con id 999.',
      );
    });

    it('lanza error si la función no está activa (RN-036)', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction({ active: false }));

      await expect(functionService.getFunctionById(1)).rejects.toThrow(
        'La función no se encuentra activa.',
      );
    });

    it('lanza error si la función ya inició (RN-035)', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction({ dateTime: yesterday }));

      await expect(functionService.getFunctionById(1)).rejects.toThrow(
        'La función ya inició y no puede seleccionarse.',
      );
    });

    it('retorna el detalle si la función es válida, marcando soldOut correctamente', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction({ availableSeats: 0 }));

      const result = await functionService.getFunctionById(1);

      expect(result).toMatchObject({
        id: 1,
        movieId: 10,
        movieTitle: 'Guardianes del Tiempo',
        format: '3D',
        room: 'Sala IMAX',
        price: 22000,
        soldOut: true, // RN-015 reutilizada: 0 sillas disponibles
      });
    });
  });

  describe('getFunctionPrices (RN-037 y RN-038)', () => {
    it('retorna el precio ya asignado a la función (varía por formato/sala/horario en origen)', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction());

      const result = await functionService.getFunctionPrices(1);

      expect(result.basePrice).toBe(22000);
      expect(result.finalPrice).toBe(22000); // sin promociones activas todavía
      expect(result.appliedPromotions).toEqual([]);
    });

    it('lanza error si se intenta calcular el precio de una función ya iniciada', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction({ dateTime: yesterday }));

      await expect(functionService.getFunctionPrices(1)).rejects.toThrow(
        'La función ya inició y no puede seleccionarse.',
      );
    });

    it('lanza error si se intenta calcular el precio de una función inactiva', async () => {
      mockedRepository.findById.mockResolvedValue(buildFunction({ active: false }));

      await expect(functionService.getFunctionPrices(1)).rejects.toThrow(
        'La función no se encuentra activa.',
      );
    });
  });
});
