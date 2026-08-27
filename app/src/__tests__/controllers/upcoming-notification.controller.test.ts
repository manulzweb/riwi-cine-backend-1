// app/src/__tests__/controllers/upcoming-notification.controller.test.ts

import { Request, Response } from 'express';
import { registerUpcomingNotification } from '../../controllers/upcoming-notification.controller.js';
import upcomingNotificationService from '../../services/upcoming-notification.service.js';

jest.mock('../../services/upcoming-notification.service.js', () => ({
  __esModule: true,
  default: { register: jest.fn() },
}));

describe('UpcomingNotificationController · HU-005', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonFn: jest.Mock;
  let statusFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockResponse = { status: statusFn };
  });

  it('debería retornar 201 con el registro exitoso', async () => {
    mockRequest = { body: { movieId: 1, userId: 12 } };
    (upcomingNotificationService.register as jest.Mock).mockResolvedValue({
      id: 99,
      userId: 12,
      movieId: 1,
    });

    await registerUpcomingNotification(mockRequest as Request, mockResponse as Response);

    expect(statusFn).toHaveBeenCalledWith(201);
    expect(jsonFn).toHaveBeenCalledWith({
      message: 'Solicitud de notificación registrada exitosamente.',
      data: { id: 99, userId: 12, movieId: 1 },
    });
  });

  it('debería retornar 400 si el servicio lanza un error', async () => {
    mockRequest = { body: { movieId: 1, userId: 12 } };
    (upcomingNotificationService.register as jest.Mock).mockRejectedValue(
      new Error('Ya registraste una solicitud de notificación para esta película.'),
    );

    await registerUpcomingNotification(mockRequest as Request, mockResponse as Response);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({
      error: 'Ya registraste una solicitud de notificación para esta película.',
    });
  });

  it('debería retornar 400 si la película ya está en cartelera', async () => {
    mockRequest = { body: { movieId: 1, userId: 12 } };
    (upcomingNotificationService.register as jest.Mock).mockRejectedValue(
      new Error('La película ya se encuentra en cartelera.'),
    );

    await registerUpcomingNotification(mockRequest as Request, mockResponse as Response);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({
      error: 'La película ya se encuentra en cartelera.',
    });
  });
});
