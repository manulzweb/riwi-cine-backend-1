// app/src/__tests__/password.service.test.ts

import PasswordService from '../services/password.service.js';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('debe generar un hash bcrypt válido y su salt', async () => {
      const result = await passwordService.hash('MySecretPass123!');

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
      expect(result.hash.startsWith('$2')).toBe(true);
      expect(result.salt.startsWith('$2')).toBe(true);
    });

    it('debe generar salts y hashes distintos para la misma contraseña', async () => {
      const result1 = await passwordService.hash('SamePassword123!');
      const result2 = await passwordService.hash('SamePassword123!');

      expect(result1.salt).not.toBe(result2.salt);
      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('verify', () => {
    it('debe retornar true si la contraseña coincide con el hash', async () => {
      const plain = 'CorrectPassword123!';
      const { hash } = await passwordService.hash(plain);

      const isValid = await passwordService.verify(plain, hash);
      expect(isValid).toBe(true);
    });

    it('debe retornar false si la contraseña no coincide', async () => {
      const { hash } = await passwordService.hash('CorrectPassword123!');

      const isValid = await passwordService.verify('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('dummyVerify (Mitigación de Timing Attacks)', () => {
    it('debe retornar false al verificar una contraseña contra el hash simulado', async () => {
      const isValid = await passwordService.dummyVerify('any_password');
      expect(isValid).toBe(false);
    });

    it('debe manejar llamadas sin contraseña (undefined)', async () => {
      const isValid = await passwordService.dummyVerify();
      expect(isValid).toBe(false);
    });

    it('debe reutilizar el hash simulado en llamadas consecutivas', async () => {
      const firstCall = await passwordService.dummyVerify('attempt1');
      const secondCall = await passwordService.dummyVerify('attempt2');

      expect(firstCall).toBe(false);
      expect(secondCall).toBe(false);
    });
  });
});
