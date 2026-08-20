// app/src/__tests__/jobs/upcoming-release.job.test.ts

import emailNotificationService from '../../services/email-notification.service';
import { startUpcomingReleaseJob } from '../../jobs/upcoming-release.job';

jest.mock('../../services/email-notification.service', () => ({
  __esModule: true,
  default: { processTodayReleases: jest.fn() },
}));

jest.mock('node-cron', () => ({
  __esModule: true,
  default: { schedule: jest.fn() },
}));

const cronMock = jest.mocked(
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require('node-cron') as { default: { schedule: jest.Mock } }).default,
);

describe('UpcomingReleaseJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear un cron job con schedule válido', () => {
    cronMock.schedule.mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
    } as never);

    startUpcomingReleaseJob();

    expect(cronMock.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
  });

  it('debería llamar a processTodayReleases al ejecutar el callback', async () => {
    let capturedCb: () => Promise<void>;
    cronMock.schedule.mockImplementation((_schedule: string, cb: () => Promise<void>) => {
      capturedCb = cb;
      return { start: jest.fn(), stop: jest.fn() } as never;
    });

    (emailNotificationService.processTodayReleases as jest.Mock).mockResolvedValue({
      moviesProcessed: 2,
      emailsSent: 5,
      errors: [],
    });

    startUpcomingReleaseJob();
    await capturedCb!();

    expect(emailNotificationService.processTodayReleases).toHaveBeenCalledTimes(1);
  });

  it('debería manejar errores sin lanzar excepción', async () => {
    let capturedCb: () => Promise<void>;
    cronMock.schedule.mockImplementation((_schedule: string, cb: () => Promise<void>) => {
      capturedCb = cb;
      return { start: jest.fn(), stop: jest.fn() } as never;
    });

    (emailNotificationService.processTodayReleases as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    startUpcomingReleaseJob();
    await expect(capturedCb!()).resolves.toBeUndefined();
  });
});
