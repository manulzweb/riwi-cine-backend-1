// app/src/__tests__/setup/env.setup.ts

/**
 * Variables de entorno para la suite de pruebas.
 * Jest no carga el .env del proyecto: este archivo se ejecuta antes de cada
 * suite y define lo mínimo que necesitan los tokens y el bloqueo de cuenta.
 */

process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MAX_LOGIN_ATTEMPTS = '5';
process.env.LOCK_TIME_MINUTES = '15';
process.env.DB_CONTAINER_NAME = 'localhost';
process.env.POSTGRES_USER = 'test';
process.env.POSTGRES_PASSWORD = 'test';
process.env.POSTGRES_DB = 'test';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASS = 'test';
process.env.SMTP_FROM = 'test@test.com';
