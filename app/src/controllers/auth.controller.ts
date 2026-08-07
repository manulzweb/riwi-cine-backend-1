import { Request, Response } from 'express';

export const LoginAuth = async (req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ error: 'no implementado aun' });
};
