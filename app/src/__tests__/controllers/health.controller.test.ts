import { Request, Response } from 'express';
import { checkHealth } from '../../controllers/health.controller';
import sequelize from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn(),
  },
}));

describe('HealthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonFn: jest.Mock;
  let statusFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockReq = {};
    mockRes = {
      status: statusFn,
      json: jsonFn,
    };
  });

  it('should return 200 when database is healthy', async () => {
    (sequelize.authenticate as jest.Mock).mockResolvedValue(undefined);

    await checkHealth(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'OK',
        services: expect.objectContaining({ database: 'UP' }),
      }),
    );
  });

  it('should return 500 when database authentication fails', async () => {
    (sequelize.authenticate as jest.Mock).mockRejectedValue(new Error('DB unavailable'));

    await checkHealth(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'DOWN',
        services: expect.objectContaining({
          database: expect.stringMatching(/^DOWN:/),
        }),
      }),
    );
  });
});
