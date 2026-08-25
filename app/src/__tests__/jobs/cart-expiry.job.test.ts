// app/src/__tests__/jobs/cart-expiry.job.test.ts

import cron from 'node-cron';
import { startCartExpiryJob } from '../../jobs/cart-expiry.job';
import cartService from '../../services/cart.service';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../../services/cart.service');

const mockedSchedule = cron.schedule as jest.Mock;
const mockedCartService = cartService as jest.Mocked<typeof cartService>;

describe('CartExpiryJob · RN-045 / RN-046', () => {
  it('invoca expireCarts periódicamente para liberar sillas vencidas', async () => {
    mockedCartService.expireCarts.mockResolvedValue({ cartsExpired: 2, errors: [] });

    let taskFn: () => Promise<void> = async () => {};
    mockedSchedule.mockImplementation((_cron: string, fn: () => Promise<void>) => {
      taskFn = fn;
      return {} as never;
    });

    startCartExpiryJob();
    await taskFn();

    expect(mockedCartService.expireCarts).toHaveBeenCalledTimes(1);
  });

  it('no propaga errores de expireCarts (deben registrarse, no caer el job)', async () => {
    mockedCartService.expireCarts.mockRejectedValue(new Error('boom'));

    let taskFn: () => Promise<void> = async () => {};
    mockedSchedule.mockImplementation((_cron: string, fn: () => Promise<void>) => {
      taskFn = fn;
      return {} as never;
    });

    startCartExpiryJob();

    await expect(taskFn()).resolves.toBeUndefined();
  });
});
