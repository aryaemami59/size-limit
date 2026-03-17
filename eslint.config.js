import loguxConfig from '@logux/eslint-config/ts'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['fixtures/', 'packages/*/test/fixtures/']
  },
  ...loguxConfig,
  {
    rules: {
      'n/global-require': 'off',
      'no-console': 'off',
      'no-control-regex': 'off',
      'prefer-let/prefer-let': 'off'
    }
  },
  {
    files: ['**/*.test.js'],

    rules: {
      'n/no-extraneous-require': 'off'
    }
  },
  {
    files: ['packages/size-limit/run.js'],
    rules: {
      'consistent-return': 'off'
    }
  }
]
