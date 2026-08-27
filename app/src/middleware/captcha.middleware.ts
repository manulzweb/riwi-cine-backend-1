// app/src/middleware/captcha.middleware.ts

import { Request, Response, NextFunction } from 'express';
import captchaAdapter from '../services/captcha/index.js';

/**
 * Factory de middleware: permite declarar la acción esperada por ruta.
 * (Si mañana pasas a Enterprise, cada acción tiene su propia evaluación.)
 */
export const verifyCaptcha =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.body?.captchaToken;
    if (!token || typeof token !== 'string') {
      res.status(400).json({
        message: 'Captcha token is required',
      });
    }
    const result = await captchaAdapter.verify(token, req.ip);
    if (!result.success) {
      console.warn(`Captcha rejeted: ${result.reason}`);
      res.status(400).json({
        message: 'Captcha verification failed',
      });
    }
    next();
  };
