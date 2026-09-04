/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: { ignoreCodes: [151002] },
        useESM: false,
        tsconfig: {
          target: 'es2022',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          isolatedModules: true,
          resolveJsonModule: true,
          types: ['node', 'jest'],
        },
      },
    ],
  },
  clearMocks: true,
  coverageDirectory: '../coverage',
  setupFiles: ['<rootDir>/__tests__/setup/env.setup.ts'],
};
