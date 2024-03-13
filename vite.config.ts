import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    retry: 1,
    fileParallelism: !process.env.CI,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 100
      },
      reporter: ['text', 'lcov'],
      skipFull: true,
      clean: true,
      exclude: [
        '**/fixtures',
        '**/scripts',
        '**/test',
        'packages/size-limit/bin.js',
        'packages/preset-app/index.js'
      ]
    },
    testTimeout: 50_000,
    watchExclude: ['**/fixtures', '**/dist', '**/out']
  }
})
