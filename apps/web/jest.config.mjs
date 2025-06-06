export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Runs AFTER test environment is set up (for things like extending matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Path aliasing for @/ to src/
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Runs BEFORE everything else (for polyfills, global mocks, etc.)
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // Not using __mocks__ folder — relying on inline mocks
  automock: false,
};
