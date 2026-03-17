import esbuildPlugin from '@size-limit/esbuild'
import filePlugin from '@size-limit/file'
import webpackPlugin from '@size-limit/webpack'
import { join } from 'node:path'
import { expect, it } from 'vitest'

import sizeLimit from '../src/index.js'

const ROOT = join(__dirname, '..', '..', '..')
const INTEGRATION = join(ROOT, 'fixtures', 'integration', 'index.js')

it('has JS API', async () => {
  const result = await sizeLimit([webpackPlugin, filePlugin], [INTEGRATION])
  expect(result).toEqual([{ size: 123 }])
})

it('works with file module only', async () => {
  const result = await sizeLimit([filePlugin], [INTEGRATION])
  expect(result).toEqual([{ size: 21 }])
})

it('works with esbuild module', async () => {
  const result = await sizeLimit([esbuildPlugin, filePlugin], [INTEGRATION])
  expect(result).toEqual([{ size: expect.anything() }])
  expect(result[0]!.size).toBeCloseTo(90, -2)
})
