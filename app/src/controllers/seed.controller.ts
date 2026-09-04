// app/src/controllers/seed.controller.ts

import { Request, Response } from 'express';
import { ISeedService } from '../services/interfaces/seed.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';

export class SeedController {
  constructor(private readonly seedService: ISeedService) {}

  public seedFromFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Debe adjuntar un archivo JSON válido en el campo "file".',
      });
      return;
    }

    const result = await this.seedService.seedFromBuffer(req.file.buffer);
    res.status(200).json({
      success: true,
      message: 'Base de datos poblada exitosamente.',
      data: result,
    });
  });

  public seedFromJsonBody = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: 'El cuerpo de la solicitud no contiene datos JSON válidos.',
      });
      return;
    }

    const result = await this.seedService.seedFromPayload(req.body);
    res.status(200).json({
      success: true,
      message: 'Base de datos poblada exitosamente.',
      data: result,
    });
  });
}

export default SeedController;
