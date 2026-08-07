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
      failed_login_attempts: 3,
      locked_until: null,
      update,
    } as never);

    await userRepository.incrementFailedAttempts(1);

    expect(update).toHaveBeenCalledWith({
      failed_login_attempts: 4,
      locked_until: null,
    });
  });

  it('locks the account for 15 minutes on the fifth failed attempt', async () => {
    const update = jest.fn();
    UserMock.findByPk.mockResolvedValue({
      failed_login_attempts: 4,
      locked_until: null,
      update,
    } as never);

    await userRepository.incrementFailedAttempts(1);

    expect(update).toHaveBeenCalledWith({
      failed_login_attempts: 5,
      locked_until: new Date('2026-01-01T00:15:00.000Z'),
    });
  });

  it('does not write anything if the user does not exist', async () => {
    UserMock.findByPk.mockResolvedValue(null);

    await expect(userRepository.incrementFailedAttempts(99)).resolves.toBeUndefined();
  });

  it('resetFailedAttempts limpia contador, bloqueo y sella el último acceso', async () => {
    await userRepository.resetFailedAttempts(1);

    expect(UserMock.update).toHaveBeenCalledWith(
      { failed_login_attempts: 0, locked_until: null, last_login_at: now },
      { where: { id: 1 } },
    );
  });
});
