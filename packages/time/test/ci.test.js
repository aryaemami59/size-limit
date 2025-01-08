import { join } from 'node:path'
import { afterAll, afterEach, beforeEach, expect, it, vi } from 'vitest'

import { getRunningTime } from '../get-running-time'

vi.mock(import('estimo'), async importOriginal => ({
  ...(await importOriginal()),

  default: () => {
    throw new Error('libX11-xcb.so.1')
  }
}))

vi.mock(import('../cache.js'), async importOriginal => ({
  ...(await importOriginal()),

  async getCache() {
    return false
  },

  async saveCache() {}
}))

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

beforeEach(() => {
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

const EXAMPLE = join(__dirname, '../node_modules/nanoid/index.browser.js')

async function runWithError() {
  let err
  try {
    await getRunningTime(EXAMPLE)
  } catch (e) {
    err = e
  }
  return err.message
}

it('prints warning on Circle CI during the error', async () => {
  vi.stubEnv('CI', '1')

  expect(await runWithError()).toBe('libX11-xcb.so.1')
  expect(consoleWarnSpy).toHaveBeenCalledOnce()
})

it('does not prints warning on non-CI', async () => {
  expect(await runWithError()).toBe('libX11-xcb.so.1')
  expect(consoleWarnSpy).not.toHaveBeenCalled()
})
