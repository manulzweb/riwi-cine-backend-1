// app/src/middleware/captcha.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/env.js';
import captchaAdapter from '../services/captcha/index.js';

/**
 * Factory de middleware: permite declarar la acción esperada por ruta.
 */
export const verifyCaptcha =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!envConfig.RECAPTCHA.ENABLED || envConfig.NODE_ENV === 'test') {
      next();
      return;
    }

    const token = req.body?.captchaToken;
    if (!token || typeof token !== 'string') {
      res.status(400).json({
        message: 'Captcha token is required',
      });
      return;
    }

    const result = await captchaAdapter.verify(token, req.ip);
    if (!result.success) {
      console.warn(`Captcha rejected: ${result.reason}`);
      res.status(400).json({
        message: 'Captcha verification failed',
      });
      return;
    }

    next();
  };
