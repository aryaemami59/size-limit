import './force-colors.js'

import { expect, it } from 'vitest'

import createReporter from '../src/create-reporter.js'
import { SizeLimitError } from '../src/size-limit-error.js'

function print(err: Error): string {
  let stderr = ''
  const process = {
    stderr: {
      write(str: string) {
        stderr += str
        return true
      }
    }
  } as unknown as NodeJS.Process
  const processor = createReporter(process, false)
  processor.error(err)
  return stderr
}

it('has mark', () => {
  const err = new SizeLimitError('noPackage')
  expect(err.name).toBe('SizeLimitError')
})

it('has start', () => {
  const err = new SizeLimitError('noPackage')
  expect(err.stack).toContain('size-limit-error.test.ts')
})

it('has message', () => {
  const err = new SizeLimitError('noPackage')
  expect(err.message).toContain('Create npm package')
})

it('has error for unknown option', () => {
  const err = new SizeLimitError('missedPlugin', 'webpack', 'file')
  expect(print(err)).toMatchSnapshot()
})

it('has error for CLI error', () => {
  const err = new SizeLimitError(
    'cmdError',
    'cli-tool',
    'Module not found\n  @ multi ./tmp/index.js index[0]'
  )
  expect(print(err)).toMatchSnapshot()
})

it('has error for CLI error without output', () => {
  const err = new SizeLimitError('cmdError', 'cli-tool')
  expect(print(err)).toMatchSnapshot()
})

it('has error for unknown entry', () => {
  const err = new SizeLimitError('unknownEntry', 'admin')
  expect(print(err)).toMatchSnapshot()
})

it('has error for missing jiti package', () => {
  const err = new SizeLimitError('missingPackage', 'jiti', 'TypeScript config')
  expect(print(err)).toMatchSnapshot()
})
