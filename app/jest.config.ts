// app/jest.config.ts

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  coverageDirectory: '../coverage',
  setupFiles: ['<rootDir>/__tests__/setup/env.setup.ts']
};

export default config;
