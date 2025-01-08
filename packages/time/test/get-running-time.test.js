import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'

import { getCache, saveCache } from '../cache.js'
import { cleanCache, getRunningTime } from '../get-running-time.js'

const EXAMPLE = join(__dirname, '../node_modules/nanoid/index.browser.js')
const CACHE = join(__dirname, '..', '..', '.cache')

afterEach(async () => {
  vi.unstubAllEnvs()
  cleanCache()
  await rm(CACHE, { force: true, recursive: true })
})

it('calculates running time', async () => {
  let runTime = await getRunningTime(EXAMPLE)
  expect(runTime).toBeGreaterThan(0.009)
  expect(runTime).toBeLessThan(0.5)
})

it('uses cache', async () => {
  vi.stubEnv('SIZE_LIMIT_FAKE_TIME', '1')

  expect(await getRunningTime(EXAMPLE)).toBe(1)

  let throttling = await getCache()
  await saveCache(throttling * 100)
  expect(await getRunningTime(EXAMPLE)).toBe(1)

  cleanCache()
  expect(await getRunningTime(EXAMPLE)).toBe(100)

  vi.unstubAllEnvs()
})

it('ignores non-JS files', async () => {
  expect(await getRunningTime('/a.jpg')).toBe(0)
})

it('works in parallel', async () => {
  vi.stubEnv('SIZE_LIMIT_FAKE_TIME', '1')

  let times = await Promise.all([
    getRunningTime(EXAMPLE),
    getRunningTime(EXAMPLE),
    getRunningTime(EXAMPLE),
    getRunningTime(EXAMPLE)
  ])
  expect(times).toHaveLength(4)

  vi.unstubAllEnvs()
})
