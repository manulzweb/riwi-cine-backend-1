// app/src/__tests__/repositories/user.repository.test.ts

import User from '../../models/user.model';
import userRepository from '../../repositories/user.repository';

jest.mock('../../models/user.model');

const UserMock = User as jest.Mocked<typeof User>;
const now = new Date('2026-01-01T00:00:00.000Z');

describe('UserRepository · RN-027', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('increments the counter without locking when the maximum is not reached', async () => {
    const update = jest.fn();
    UserMock.findByPk.mockResolvedValue({
      failedLoginAttempts: 3,
      lockedUntil: null,
      update,
    } as never);

    await userRepository.incrementFailedAttempts(1);

    expect(update).toHaveBeenCalledWith({
      failedLoginAttempts: 4,
      lockedUntil: null,
    });
  });

  it('locks the account for 15 minutes on the fifth failed attempt', async () => {
    const update = jest.fn();
    UserMock.findByPk.mockResolvedValue({
      failedLoginAttempts: 4,
      lockedUntil: null,
      update,
    } as never);

    await userRepository.incrementFailedAttempts(1);

    expect(update).toHaveBeenCalledWith({
      failedLoginAttempts: 5,
      lockedUntil: new Date('2026-01-01T00:15:00.000Z'),
    });
  });

  it('does not write anything if the user does not exist', async () => {
    UserMock.findByPk.mockResolvedValue(null);

    await expect(userRepository.incrementFailedAttempts(99)).resolves.toBeUndefined();
  });

  it('resetFailedAttempts limpia contador, bloqueo y sella el último acceso', async () => {
    await userRepository.resetFailedAttempts(1);

    expect(UserMock.update).toHaveBeenCalledWith(
      { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now },
      { where: { id: 1 } },
    );
  });
});
