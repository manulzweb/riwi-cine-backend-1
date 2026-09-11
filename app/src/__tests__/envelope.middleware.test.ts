// app/src/__tests__/envelope.middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import { envelopeMiddleware } from '../middleware/envelope.middleware.js';

describe('Envelope Middleware (Response Envelope Pattern)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let sentJson: unknown;

  beforeEach(() => {
    mockReq = {
      originalUrl: '/api/v1/movies',
    };
    sentJson = undefined;
    mockRes = {
      statusCode: 200,
      headersSent: false,
      json: jest.fn().mockImplementation((payload) => {
        sentJson = payload;
        return mockRes;
      }),
    };
    mockNext = jest.fn();
  });

  it('debe envolver un arreglo de datos con { success: true, data: [...] }', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();

    const data = [{ id: 1, title: 'Película 1' }];
    mockRes.json!(data);

    expect(sentJson).toEqual({
      success: true,
      data,
    });
  });

  it('debe envolver un objeto de datos con { success: true, data: {...} }', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    const data = { id: 5, name: 'Combo Mega' };
    mockRes.json!(data);

    expect(sentJson).toEqual({
      success: true,
      data,
    });
  });

  it('debe manejar un objeto que solo contiene message como { success: true, message: "..." }', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    mockRes.json!({ message: 'Sesión cerrada exitosamente' });

    expect(sentJson).toEqual({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  });

  it('debe manejar message + data respetando ambos campos', () => {
    mockRes.statusCode = 201;
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    const item = { id: 10, snackId: 2, quantity: 1 };
    mockRes.json!({
      message: 'Producto agregado al carrito con éxito.',
      data: item,
    });

    expect(sentJson).toEqual({
      success: true,
      message: 'Producto agregado al carrito con éxito.',
      data: item,
    });
  });

  it('debe extraer message a primer nivel y agrupar el resto en data', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    mockRes.json!({
      message: 'Authentication successful',
      userId: 1,
      accessToken: 'token-abc',
    });

    expect(sentJson).toEqual({
      success: true,
      message: 'Authentication successful',
      data: {
        userId: 1,
        accessToken: 'token-abc',
      },
    });
  });

  it('no debe re-envolver si la respuesta ya contiene success: true o false', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    const alreadyEnveloped = {
      success: true,
      message: 'Las sillas fueron liberadas exitosamente.',
    };
    mockRes.json!(alreadyEnveloped);

    expect(sentJson).toEqual(alreadyEnveloped);
  });

  it('debe formatear errores HTTP (4xx y 5xx) con { success: false, ... }', () => {
    mockRes.statusCode = 400;
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    mockRes.json!({
      error: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos.',
    });

    expect(sentJson).toEqual({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos.',
    });
  });

  it('debe ignorar rutas de documentación Swagger (/docs) sin modificar res.json', () => {
    mockReq.originalUrl = '/api/v1/docs';
    const originalJsonFn = mockRes.json;

    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.json).toBe(originalJsonFn);
  });

  it('no debe alterar la respuesta si headersSent es true', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);
    mockRes.headersSent = true;

    mockRes.json!({ test: 'already sent' });

    expect(sentJson).toEqual({ test: 'already sent' });
  });

  it('no debe alterar valores primitivos o nulos', () => {
    envelopeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    mockRes.json!(null);
    expect(sentJson).toBeNull();
  });
});
