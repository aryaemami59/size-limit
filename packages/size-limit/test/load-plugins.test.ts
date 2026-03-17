import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import loadPlugins from '../src/load-plugins.js'
import readPkgUp from '../src/read-pkg-up.js'

describe(`load-plugins`, () => {
  it('load core plugins of size-limit', async () => {
    const cwd = join(__dirname, '..', '..', '..', 'fixtures', 'zero-esbuild')
    const pkg = await readPkgUp(cwd)
    const result = await loadPlugins(pkg)
    expect(result.isEmpty).toBe(false)
    expect(result.list.length).toBe(3)
    expect(result.has('esbuild')).toBe(true)
    expect(result.has('file')).toBe(true)
    expect(result.has('webpack-css')).toBe(true)
    expect(result.has('plugin')).toBe(false)
  })

  it('load 3rd-party plugins', async () => {
    const cwd = join(__dirname, '..', '..', '..', 'fixtures', 'plugins')
    const pkg = await readPkgUp(cwd)
    const result = await loadPlugins(pkg)
    expect(result.isEmpty).toBe(false)
    expect(result.list.length).toBe(1)
    expect(result.has('esbuild')).toBe(false)
    expect(result.has('file')).toBe(false)
    expect(result.has('node-esbuild')).toBe(true)
  })

  it('plugins should be empty if no package.json was found', async () => {
    const pkg = await readPkgUp('/')
    const result = await loadPlugins(pkg)
    expect(result.isEmpty).toBe(true)
  })
})
