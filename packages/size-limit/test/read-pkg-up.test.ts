import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import readPkgUp from '../src/read-pkg-up.js'

describe(`read-pkg-up`, () => {
  it('finds package.json of the same package', async () => {
    const cwd = join(__dirname, '..', '..', '..', 'fixtures', 'simple')
    const result = await readPkgUp(cwd)
    expect(result!.packageJson.name).toBe('simple')
    expect(result!.path).toBe(join(cwd, 'package.json'))
  })

  it('finds package.json of the size-limit', async () => {
    const cwd = join(__dirname, 'fixtures')
    const result = await readPkgUp(cwd)
    expect(result!.path).toBe(join(__dirname, '..', 'package.json'))
  })

  it('package.json should be undefined if no package.json was found', async () => {
    expect(await readPkgUp('/')).toBeUndefined()
  })
})
