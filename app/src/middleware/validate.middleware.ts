// app/src/middleware/validate.middleware.ts

import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { formatZodError } from '../utils/zod-error.util';

type RequestSource = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, source: RequestSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      const { error, details } = formatZodError(parsed.error);
      res.status(400).json({ error, details });
      return;
    }

    req[source] = parsed.data;
    next();
  };
};
