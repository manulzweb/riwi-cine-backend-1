// app/src/__tests__/auth.middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { TokenService } from '../services/auth-token.service.js';

describe('Auth Middleware (Control de Autenticación y Roles)', () => {
  let tokenService: TokenService;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    tokenService = new TokenService();
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authMiddleware (Control de Roles)', () => {
    it('debe responder 401 si no se envía header Authorization', () => {
      const middleware = authMiddleware([1, 2]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Authorization Bearer token is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe responder 401 si el token es inválido o corrupto', () => {
      mockReq.headers = { authorization: 'Bearer invalid.token' };
      const middleware = authMiddleware([1]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid or expired access token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe responder 403 si el rol del usuario no está en allowedRoles', () => {
      // Generamos token con rol 1 (cliente regular)
      const token = tokenService.generateAccessToken(10, 1);
      mockReq.headers = { authorization: `Bearer ${token}` };

      // Requerimos rol 2 (Admin) o 3 (Superadmin)
      const middleware = authMiddleware([2, 3]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Access denied',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe asignar req.user y llamar next() si el rol está permitido', () => {
      // Generamos token con rol 2 (Admin)
      const token = tokenService.generateAccessToken(20, 2);
      mockReq.headers = { authorization: `Bearer ${token}` };

      const middleware = authMiddleware([2, 3]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.sub).toBe('20');
      expect(mockReq.user?.role).toBe(2);
    });

    it('debe permitir acceso a cualquier rol si allowedRoles está vacío', () => {
      const token = tokenService.generateAccessToken(30, 1);
      mockReq.headers = { authorization: `Bearer ${token}` };

      const middleware = authMiddleware([]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user?.sub).toBe('30');
    });
  });

  describe('requireAuth (Autenticación para Carrito HU-011)', () => {
    it('debe responder 401 si falta el header Authorization', () => {
      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token de autenticación no proporcionado.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe responder 401 si el token es inválido', () => {
      mockReq.headers = { authorization: 'Bearer token-falso' };
      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe asignar req.userId numérico y llamar next() con token válido', () => {
      const token = tokenService.generateAccessToken(99, 1);
      mockReq.headers = { authorization: `Bearer ${token}` };

      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(99);
    });
  });

  describe('optionalAuth', () => {
    it('debe llamar next() sin error si no hay header de autorización', () => {
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBeUndefined();
    });

    it('debe extraer req.userId si se proporciona un token válido', () => {
      const token = tokenService.generateAccessToken(77, 1);
      mockReq.headers = { authorization: `Bearer ${token}` };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(77);
    });
  });
});
