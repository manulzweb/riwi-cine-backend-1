// app/src/__tests__/setup/env.setup.ts

process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.JWT_SECRET = 'test-access-token-secret-1234567890';
process.env.JWT_REFRESH_SECRET = 'test-refresh-token-secret-1234567890';
process.env.FRONTEND_URL = 'http://localhost:5173';
