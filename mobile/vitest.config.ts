import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure-logic tests only. React Native / Expo modules are not imported here,
    // so a plain node environment is correct and fast (Doc 11 test pyramid).
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
