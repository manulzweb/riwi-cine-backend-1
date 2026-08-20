import { Request, Response } from 'express';
import cityService from '../services/city.service';

export const getCities = async (req: Request, res: Response): Promise<Response> => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    const cities = await cityService.findByDepartmentId(departmentId);
    return res.status(200).json(cities);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
