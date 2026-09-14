import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/tests/setup.ts'],
    // DB tests share one Postgres instance — no parallel files
    fileParallelism: false,
    testTimeout: 20_000,
    include: ['src/**/*.test.ts'],
  },
})
