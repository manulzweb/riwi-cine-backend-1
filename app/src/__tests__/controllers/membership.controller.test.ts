// app/src/__tests__/controllers/membership.controller.test.ts

import { Request, Response } from 'express';
import { createMembership } from '../../controllers/membership.controller';
import { User, Membership, MembershipLevel, MembershipStatus } from '../../models';

jest.mock('../../models', () => {
  return {
    User: {
      findByPk: jest.fn(),
    },
    Membership: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    MembershipLevel: {
      findOne: jest.fn(),
    },
    MembershipStatus: {
      findOne: jest.fn(),
    },
  };
});

describe('MembershipController · HU-006 Create Membership', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonFn: jest.Mock;
  let statusFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockResponse = {
      status: statusFn,
    };
  });

  it('should return 400 if userId is missing', async () => {
    mockRequest = { body: {} };
    await createMembership(mockRequest as Request, mockResponse as Response);
    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'El ID de usuario es obligatorio' });
  });

  it('should return 404 if user does not exist', async () => {
    mockRequest = { body: { userId: 999 } };
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await createMembership(mockRequest as Request, mockResponse as Response);
    expect(statusFn).toHaveBeenCalledWith(404);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  it('should return 400 if membership already exists for the user', async () => {
    mockRequest = { body: { userId: 1 } };
    (User.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
    (Membership.findOne as jest.Mock).mockResolvedValue({ id: 5 });

    await createMembership(mockRequest as Request, mockResponse as Response);
    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'El usuario ya cuenta con una membresía digital activa' });
  });

  it('should return 201 and membership details on success', async () => {
    mockRequest = { body: { userId: 1 } };
    (User.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
    (Membership.findOne as jest.Mock).mockResolvedValue(null);
    (MembershipLevel.findOne as jest.Mock).mockResolvedValue({ id: 10, name: 'BÁSICA' });
    (MembershipStatus.findOne as jest.Mock).mockResolvedValue({ id: 20, name: 'Activa' });
    (Membership.create as jest.Mock).mockResolvedValue({
      id: 50,
      userId: 1,
      code: 'MC-123456-789012',
      pointsBalance: 0,
    });

    await createMembership(mockRequest as Request, mockResponse as Response);
    expect(statusFn).toHaveBeenCalledWith(201);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Membresía digital creada exitosamente',
        data: expect.objectContaining({
          id: 50,
          userId: 1,
          code: expect.any(String),
          pointsBalance: 0,
          level: 'BÁSICA',
          status: 'Activa',
        }),
      })
    );
  });
});
