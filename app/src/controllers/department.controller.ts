import { Request, Response } from 'express';
import departmentService from '../services/department.service';

export const getDepartments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const countryId = parseInt(req.params.countryId, 10);
    const departments = await departmentService.findByCountryId(countryId);
    return res.status(200).json(departments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
