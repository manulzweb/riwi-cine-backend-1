import { Request, Response } from 'express';
import countryService from '../services/country.service';

export const getCountries = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const countries = await countryService.findAll();
    return res.status(200).json(countries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
