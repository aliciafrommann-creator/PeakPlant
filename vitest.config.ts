import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Server-side logic only: the money paths (price lookup, order amounts),
    // the fail-closed secrets and the rate limit. No React/JSX here — those
    // surfaces are covered by the build and by manual checks, and a DOM test
    // setup would be a second toolchain to maintain for little gain.
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
})
