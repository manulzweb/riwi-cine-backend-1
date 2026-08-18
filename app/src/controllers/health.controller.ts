import { Request, Response } from 'express';
import sequelize from '../config/database';

export const checkHealth = async (req: Request, res: Response): Promise<Response> => {
  const healthInfo = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'UP',
    },
  };

  try {
    await sequelize.authenticate();
    return res.status(200).json(healthInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    return res.status(500).json({
      status: 'DOWN',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: `DOWN: ${message}`,
      },
    });
  }
};
