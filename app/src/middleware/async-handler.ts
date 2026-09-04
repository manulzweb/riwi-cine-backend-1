// app/src/middleware/async-handler.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Envuelve un handler async para que cualquier `throw` o `Promise.reject`
 * llegue al `errorHandler` central sin repetir try/catch en cada controller.
 *
 * Uso:
 *   export const getCountries = asyncHandler(async (_req, res) => {
 *     const data = await service.findAll();
 *     res.json(data);
 *   });
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
