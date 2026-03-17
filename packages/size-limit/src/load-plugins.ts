import type { Check } from '../src/index.js'
import type { Package } from './read-pkg-up.js'

function toArray(obj: any): string[] {
  return typeof obj === 'object' ? Object.keys(obj) : []
}

export type SizeLimitPluginConfig = {
  cleanDir?: boolean
  compareWith?: string
  configPath?: string
  project?: string
  saveBundle?: boolean
  watch?: boolean
  why?: boolean
}

export type Config = {
  checks: Check[]
  cwd?: string
  configPath?: string
  project?: string
  why?: boolean
  compareWith?: string
  saveBundle?: string
  cleanDir?: boolean
  hidePassed?: boolean
  highlightLess?: boolean
  failed?: boolean
  missed?: boolean
}

export type BuiltinPlugins = {
  'esbuild': {
    before: (config: Config, check: Check) => Promise<void>
    finally: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/esbuild'
    step20: (config: Config, check: Check) => Promise<void>
    step40: (config: Config, check: Check) => Promise<void>
    step61: (config: Config, check: Check) => Promise<void>
    wait40: string
  }
  'esbuild-why': {
    name: '@size-limit/esbuild-why'
    step81: (config: Config, check: Check) => Promise<void>
    finally: (config: Config, check: Check) => Promise<void>
  }
  'file': {
    name: '@size-limit/file'
    step60: (config: Config, check: Check) => Promise<void>
  }
  'time': {
    name: '@size-limit/time'
    step80: (config: Config, check: Check) => Promise<void>
    wait80: string
  }
  'webpack-css': {
    before: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/webpack-css'
  }
  'webpack-why': {
    before: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/webpack-why'
  }
  'webpack': {
    before: (config: Config) => Promise<void>
    finally: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/webpack'
    step20: (config: Config, check: Check) => Promise<void>
    step40: (config: Config, check: Check) => Promise<void>
    step61: (config: Config, check: Check) => Promise<void>
    wait40: string
  }
}

export class Plugins {
  constructor(
    list: (
      | {
          name: '@size-limit/time'
          step80: (config: Config, check: Check) => Promise<void>
          wait80: string
        }
      | {
          name: '@size-limit/file'
          step60: (config: Config, check: Check) => Promise<void>
        }
      | {
          before: (config: Config, check: Check) => Promise<void>
          finally: (config: Config, check: Check) => Promise<void>
          name: '@size-limit/esbuild'
          step20: (config: Config, check: Check) => Promise<void>
          step40: (config: Config, check: Check) => Promise<void>
          step61: (config: Config, check: Check) => Promise<void>
          wait40: string
        }
      | {
          before: (config: Config, check: Check) => Promise<void>
          name: '@size-limit/webpack-css'
        }
      | {
          before: (config: Config, check: Check) => Promise<void>
          finally: (config: Config, check: Check) => Promise<void>
          name: '@size-limit/webpack'
          step20: (config: Config, check: Check) => Promise<void>
          step40: (config: Config, check: Check) => Promise<void>
          step61: (config: Config, check: Check) => Promise<void>
          wait40: string
        }
      | {
          before: (config: Config, check: Check) => Promise<void>
          name: '@size-limit/webpack-why'
        }
    )[]
  ) {
    this.list = list
    this.isEmpty = list.length === 0
  }

  list: (
    | {
        name: '@size-limit/time'
        step80: (config: Config, check: Check) => Promise<void>
        wait80: string
      }
    | {
        name: '@size-limit/file'
        step60: (config: Config, check: Check) => Promise<void>
      }
    | {
        before: (config: Config, check: Check) => Promise<void>
        finally: (config: Config, check: Check) => Promise<void>
        name: '@size-limit/esbuild'
        step20: (config: Config, check: Check) => Promise<void>
        step40: (config: Config, check: Check) => Promise<void>
        step61: (config: Config, check: Check) => Promise<void>
        wait40: string
      }
    | {
        before: (config: Config, check: Check) => Promise<void>
        name: '@size-limit/webpack-css'
      }
    | {
        before: (config: Config, check: Check) => Promise<void>
        finally: (config: Config, check: Check) => Promise<void>
        name: '@size-limit/webpack'
        step20: (config: Config, check: Check) => Promise<void>
        step40: (config: Config, check: Check) => Promise<void>
        step61: (config: Config, check: Check) => Promise<void>
        wait40: string
      }
    | {
        before: (config: Config, check: Check) => Promise<void>
        name: '@size-limit/webpack-why'
      }
  )[]

  isEmpty: boolean

  has(
    type:
      | 'esbuild'
      | 'file'
      | 'time'
      | 'webpack-css'
      | 'webpack-why'
      | 'webpack'
      | string
      | (string & Record<string, never>)
  ): boolean {
    return this.list.some(
      i => i.name === `@size-limit/${type}` || i.name === `size-limit-${type}`
    )
  }
}

export default async function loadPlugins(result?: Package): Promise<Plugins> {
  if (!result) return new Plugins([])
  const pkg = result.packageJson

  const list = await Promise.all(
    toArray(pkg.dependencies)
      .concat(toArray(pkg.devDependencies))
      .concat(toArray(pkg.optionalDependencies))
      .filter(
        (i: string) =>
          i.startsWith('@size-limit/') || i.startsWith('size-limit-')
      )
      .map((i: string) => import(i).then((module: any) => module.default))
  ).then((arr: any[]) => arr.flat())

  return new Plugins(list)
}
