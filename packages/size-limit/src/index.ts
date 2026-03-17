import calc from './calc.js'
import { Plugins } from './load-plugins.js'

export { processImport } from './process-import.js'
export { SizeLimitError } from './size-limit-error.js'

/**
 * Represents the options for the size-limit check time property to customize `@size-limit/time` plugin.
 */
export type TimeOptions = {
  /**
   * A network speed to calculate loading time of files.
   * It should be a string with a number and unit, separated by a space.
   * Format: `100 B`, `10 kB`.
   * @default "50 kB"
   */
  networkSpeed?: string | number

  /**
   * Delay for calculating loading time that simulates network latency
   * It should be a string with a number and unit, separated by a space.
   * Format: `500 ms`, `1 s`.
   * @default: "0"
   */
  latency: string | number

  /**
   * A message for loading time details
   * @default "on slow 3G"
   */
  loadingMessage?: string
}

/**
 * Represents the options for the size-limit check.
 */
export type Check = {
  /**
   * With `false` it will disable any compression.
   */
  brotli?: boolean

  /**
   * Path to `stats.json` from another build to compare (when `--why` is using).
   */
  compareWith?: string

  /**
   * A path to a custom webpack config.
   */
  config?: string

  disableModuleConcatenation?: boolean

  /**
   * When using a custom webpack config, a webpack entry could be given.
   * It could be a string or an array of strings. By default,
   * the total size of all entry points will be checked.
   */
  entry?: string | string[]

  /**
   * With `true` it will use Gzip compression and disable Brotli compression.
   */
  gzip?: boolean

  hidePassed?: boolean

  highlightLess?: boolean

  /**
   * An array of files and dependencies to exclude from
   * the project size calculation.
   */
  ignore?: string[]

  /**
   * Partial import to test tree-shaking. It could be `"{ lib }"` to test
   * `import { lib } from 'lib'`, `*` to test all exports, or
   * `{ "a.js": "{ a }", "b.js": "{ b }" }` to test multiple files.
   */
  import?: string | Record<string, string>

  /**
   * Size or time limit for files from the path option.
   * It should be a string with a number and unit, separated by a space.
   * Format: `100 B`, `10 kB`, `500 ms`, `1 s`.
   */
  limit?: string

  modifyEsbuildConfig?: (config?: any) => any

  /**
   * (`.size-limit.js` only) Function that can be used to do last-minute
   * changes to the webpack config, like adding a plugin.
   */
  modifyWebpackConfig?: (config?: any) => any

  module?: boolean

  /**
   * The name of the current section.
   * It will only be useful if you have multiple sections.
   */
  name?: string

  /**
   * Relative paths to files. The only mandatory option.
   * It could be a path `"index.js"`, a
   * {@link https://github.com/SuperchupuDev/tinyglobby pattern}
   * `"dist/app-*.js"` or an array
   * `["index.js", "dist/app-*.js", "!dist/app-exclude.js"]`.
   */
  path?: string | string[]

  /**
   * With `false` it will disable calculating running time.
   */
  running?: boolean

  /**
   * Custom UI reports list.
   *
   * @see {@link https://github.com/statoscope/statoscope/tree/master/packages/webpack-plugin#optionsreports-report Statoscope docs}
   */
  uiReports?: object

  /**
   * With `false` it will disable webpack.
   */
  webpack?: boolean

  /**
   * Options for `@size-limit/time` plugin.
   */
  time?: TimeOptions

  // Runtime properties added by plugins
  files?: string[]
  size?: number
  sizeLimit?: number | undefined
  timeLimit?: number | undefined
  totalTime?: number
  runTime?: number
  loadTime?: number
  passed?: boolean
  missed?: boolean
  message?: string
}

// /**
//  * Represents the options for the size-limit check.
//  */
// export interface Check {
//   /**
//    * With `false` it will disable any compression.
//    */
//   brotli?: boolean

//   /**
//    * Path to `stats.json` from another build to compare (when `--why` is using).
//    */
//   compareWith?: string

//   /**
//    * A path to a custom webpack config.
//    */
//   config?: string

//   disableModuleConcatenation?: boolean

//   /**
//    * When using a custom webpack config, a webpack entry could be given.
//    * It could be a string or an array of strings. By default,
//    * the total size of all entry points will be checked.
//    */
//   entry?: string | string[]

//   /**
//    * With `true` it will use Gzip compression and disable Brotli compression.
//    */
//   gzip?: boolean

//   hidePassed?: boolean

//   highlightLess?: boolean

//   /**
//    * An array of files and dependencies to exclude from
//    * the project size calculation.
//    */
//   ignore?: string[]

//   /**
//    * Partial import to test tree-shaking. It could be `"{ lib }"` to test
//    * `import { lib } from 'lib'`, `*` to test all exports, or
//    * `{ "a.js": "{ a }", "b.js": "{ b }" }` to test multiple files.
//    */
//   import?: string | Record<string, string>

//   /**
//    * Size or time limit for files from the path option.
//    * It should be a string with a number and unit, separated by a space.
//    * Format: `100 B`, `10 kB`, `500 ms`, `1 s`.
//    */
//   limit?: string

//   modifyEsbuildConfig?: (config?: any) => any

//   /**
//    * (`.size-limit.js` only) Function that can be used to do last-minute
//    * changes to the webpack config, like adding a plugin.
//    */
//   modifyWebpackConfig?: (config?: any) => any

//   module?: boolean

//   /**
//    * The name of the current section.
//    * It will only be useful if you have multiple sections.
//    */
//   name?: string

//   /**
//    * Relative paths to files. The only mandatory option.
//    * It could be a path `"index.js"`, a
//    * {@link https://github.com/SuperchupuDev/tinyglobby pattern}
//    * `"dist/app-*.js"` or an array
//    * `["index.js", "dist/app-*.js", "!dist/app-exclude.js"]`.
//    */
//   path?: string | string[]

//   /**
//    * With `false` it will disable calculating running time.
//    */
//   running?: boolean

//   /**
//    * Custom UI reports list.
//    *
//    * @see {@link https://github.com/statoscope/statoscope/tree/master/packages/webpack-plugin#optionsreports-report Statoscope docs}
//    */
//   uiReports?: object

//   /**
//    * With `false` it will disable webpack.
//    */
//   webpack?: boolean

//   /**
//    * Options for `@size-limit/time` plugin.
//    */
//   time?: TimeOptions

//   // Runtime properties added by plugins
//   files?: string[]
//   size?: number
//   sizeLimit?: number
//   timeLimit?: number
//   totalTime?: number
//   runTime?: number
//   loadTime?: number
//   passed?: boolean
//   missed?: boolean
//   message?: string
// }

// /**
//  * Represents the options for the size-limit check time property to customize `@size-limit/time` plugin.
//  */
// export interface TimeOptions {
//   /**
//    * A network speed to calculate loading time of files.
//    * It should be a string with a number and unit, separated by a space.
//    * Format: `100 B`, `10 kB`.
//    * @default "50 kB"
//    */
//   networkSpeed?: string | number

//   /**
//    * Delay for calculating loading time that simulates network latency
//    * It should be a string with a number and unit, separated by a space.
//    * Format: `500 ms`, `1 s`.
//    * @default: "0"
//    */
//   latency: string | number

//   /**
//    * A message for loading time details
//    * @default "on slow 3G"
//    */
//   loadingMessage?: string
// }

export type Messages = {
  argWithoutAnalyzer: (
    arg: string,
    bundler: string,
    analyzer?: string
  ) => string
  argWithoutAnotherArg: (arg: string, anotherArg: string) => string
  argWithoutParameter: (arg: string, parameter: string) => string
  argWithoutPlugins: (arg: string, mod1: string, mod2: string) => string
  bundleDirNotEmpty: (dir: string) => string
  cmdError: (cmd: string, error: string) => string
  emptyConfig: () => string
  entryNotString: () => string
  missedPlugin: (mod: string) => string
  missingPackage: (pkg: string, usage: string) => string
  multiPluginlessConfig: (opt: string, mod1: string, mod2: string) => string
  noArrayConfig: () => string
  noConfig: () => string
  noObjectCheck: () => string
  noPackage: () => string
  pathNotString: () => string
  pluginlessConfig: (arg: string, mod: string) => string
  timeWithoutPlugin: () => string
  unknownArg: (arg: string) => string
  unknownEntry: (entry: string) => string
  unknownOption: (opt: string) => string
}

export type MessageTypes = NonNullable<keyof Messages>

export type AddConfigExample = {
  emptyConfig: true
  noArrayConfig: true
  noConfig: true
  noObjectCheck: true
  pathNotString: true
}

// export declare class SizeLimitError<T extends MessageTypes> extends Error {
//   name: 'SizeLimitError'

//   example: T extends keyof AddConfigExample ? string : undefined

//   constructor(type: T, ...args: Parameters<Messages[T]>)
// }

// export interface Config {
//   checks: Check[]
//   cwd?: string
//   configPath?: string
//   project?: string
//   why?: boolean
//   compareWith?: string
//   saveBundle?: string
//   cleanDir?: boolean
//   hidePassed?: boolean
//   highlightLess?: boolean
//   failed?: boolean
//   missed?: boolean
// }

export type SizeLimitConfig = Check[]

export type BuiltinPlugins = {
  'esbuild': {}
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
    before: (config: Config, /* not used */ check: Check) => Promise<void>
    name: '@size-limit/webpack-css'
  }
  'webpack-why': {
    before: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/webpack-why'
  }
  'webpack': {
    before: (config: Config, /* not used */ check: Check) => Promise<void>
    finally: (config: Config, check: Check) => Promise<void>
    name: '@size-limit/webpack'
    step20: (config: Config, check: Check) => Promise<void>
    step40: (config: Config, check: Check) => Promise<void>
    step61: (config: Config, check: Check) => Promise<void>
    wait40: string
  }
}

export type BuiltinPluginsNames = NonNullable<keyof BuiltinPlugins>

export type SizeLimitPluginConfig = {
  cleanDir?: boolean
  compareWith?: string
  configPath?: string
  project?: string
  saveBundle?: boolean
  watch?: boolean
  why?: boolean
}

// type PluginsConstructor<
//   T extends SizeLimitPlugin[] = (
//     | {
//         name: '@size-limit/time'
//         step80: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         wait80: string
//       }
//     | {
//         name: '@size-limit/file'
//         step60: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//       }
//     | {
//         before: (config: SizeLimitPluginConfig) => Promise<void>
//         finally: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         name: '@size-limit/esbuild'
//         step20: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         step40: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         step61: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         wait40: string
//       }
//     | {
//         before: (config: SizeLimitPluginConfig) => Promise<void>
//         name: '@size-limit/webpack-css'
//       }
//     | {
//         before: (config: SizeLimitPluginConfig) => Promise<void>
//         finally: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         name: '@size-limit/webpack'
//         step20: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         step40: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         step61: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         wait40: string
//       }
//     | {
//         before: (config: SizeLimitPluginConfig, check: Check) => Promise<void>
//         name: '@size-limit/webpack-why'
//       }
//   )[]
// > = {
//   list: Partial<SizeLimitPlugin>[]
//   isEmpty: boolean

//   new (list: Partial<SizeLimitPlugin>[]): Plugins<T>
//   has(
//     type:
//       | 'esbuild'
//       | 'file'
//       | 'time'
//       | 'webpack-css'
//       | 'webpack-why'
//       | 'webpack'
//   ): boolean
// }

export type SizeLimitPlugin = {
  before: (config: Config, check: Check) => Promise<void>
  finally: (config: Config, check: Check) => Promise<void>
  // | `${'@size-limit/' | 'size-limit-'}${string}`
  name: string
  step20: (config: Config, check: Check) => Promise<void>
  step40: (config: Config, check: Check) => Promise<void>
  step60: (config: Config, check: Check) => Promise<void>
  step61: (config: Config, check: Check) => Promise<void>
  step80: (config: Config, check: Check) => Promise<void>
  step81: (config: Config, check: Check) => Promise<void>
  wait40: string
  wait80: string
} & Omit<BuiltinPlugins, 'name'>
// export type SizeLimitPlugin = {
//   before: (config: Config, check: Check) => Promise<void>
//   finally: (config: Config, check: Check) => Promise<void>
//   name?: `${'@size-limit/' | 'size-limit-'}${string}`
//   step20: (config: Config, check: Check) => Promise<void>
//   step40: (config: Config, check: Check) => Promise<void>
//   step60: (config: Config, check: Check) => Promise<void>
//   step61: (config: Config, check: Check) => Promise<void>
//   step80: (config: Config, check: Check) => Promise<void>
//   step81: (config: Config, check: Check) => Promise<void>
//   wait40: string
//   wait80: string
// } & BuiltinPlugins[keyof BuiltinPlugins]

// export declare class Plugins implements PluginsConstructor {
//   // this: PluginsConstructor<T>
//   // isEmpty: [] extends T ? true : false
//   isEmpty: boolean

//   constructor(
//     list: (
//       | {
//           name: '@size-limit/time'
//           step80: (config: SizeLimitConfig, check: Check) => Promise<void>
//           wait80: string
//         }
//       | {
//           name: '@size-limit/file'
//           step60: (config: SizeLimitConfig, check: Check) => Promise<void>
//         }
//       | {
//           before: (config: SizeLimitConfig) => Promise<void>
//           finally: (config: SizeLimitConfig, check: Check) => Promise<void>
//           name: '@size-limit/esbuild'
//           step20: (config: SizeLimitConfig, check: Check) => Promise<void>
//           step40: (config: SizeLimitConfig, check: Check) => Promise<void>
//           step61: (config: SizeLimitConfig, check: Check) => Promise<void>
//           wait40: string
//         }
//       | {
//           before: (config: SizeLimitConfig) => Promise<void>
//           name: '@size-limit/webpack-css'
//         }
//       | {
//           before: (config: SizeLimitConfig) => Promise<void>
//           finally: (config: SizeLimitConfig, check: Check) => Promise<void>
//           name: '@size-limit/webpack'
//           step20: (config: SizeLimitConfig, check: Check) => Promise<void>
//           step40: (config: SizeLimitConfig, check: Check) => Promise<void>
//           step61: (config: SizeLimitConfig, check: Check) => Promise<void>
//           wait40: string
//         }
//       | {
//           before: (config: SizeLimitConfig, check: Check) => Promise<void>
//           name: '@size-limit/webpack-why'
//         }
//     )[]
//   )

//   // { isEmpty: true; list: [] }

//   list: (
//     | {
//         name: '@size-limit/time'
//         step80: (config: SizeLimitConfig, check: Check) => Promise<void>
//         wait80: string
//       }
//     | {
//         name: '@size-limit/file'
//         step60: (config: SizeLimitConfig, check: Check) => Promise<void>
//       }
//     | {
//         before: (config: SizeLimitConfig) => Promise<void>
//         finally: (config: SizeLimitConfig, check: Check) => Promise<void>
//         name: '@size-limit/esbuild'
//         step20: (config: SizeLimitConfig, check: Check) => Promise<void>
//         step40: (config: SizeLimitConfig, check: Check) => Promise<void>
//         step61: (config: SizeLimitConfig, check: Check) => Promise<void>
//         wait40: string
//       }
//     | {
//         before: (config: SizeLimitConfig) => Promise<void>
//         name: '@size-limit/webpack-css'
//       }
//     | {
//         before: (config: SizeLimitConfig) => Promise<void>
//         finally: (config: SizeLimitConfig, check: Check) => Promise<void>
//         name: '@size-limit/webpack'
//         step20: (config: SizeLimitConfig, check: Check) => Promise<void>
//         step40: (config: SizeLimitConfig, check: Check) => Promise<void>
//         step61: (config: SizeLimitConfig, check: Check) => Promise<void>
//         wait40: string
//       }
//     | {
//         before: (config: SizeLimitConfig, check: Check) => Promise<void>
//         name: '@size-limit/webpack-why'
//       }
//   )[]

//   isEmpty: false

//   has(
//     type:
//       | 'esbuild'
//       | 'file'
//       | 'time'
//       | 'webpack-css'
//       | 'webpack-why'
//       | 'webpack'
//   ): boolean
// }

// export type { PluginsConstructor }

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

type CheckResult = {
  size?: number
  time?: number
  runTime?: number
  loadTime?: number
}

/**
 * Run Size Limit and return the result.
 *
 * @param plugins   The list of plugins like `@size-limit/time`
 * @param  files Path to files or internal config
 * @return Project size
 */
export default async function sizeLimitAPI(
  plugins: SizeLimitPlugin[],
  files:
    | string[]
    | {
        checks: (Required<Pick<Check, 'files'>> &
          Pick<Check, 'runTime' | 'time' | 'loadTime' | 'size'>)[]
      }
) {
  const pluginList = new Plugins(
    plugins.reduce(
      (all, i: SizeLimitPlugin) => all.concat(i),
      [] as SizeLimitPlugin[] as any
    )
  )
  if (Array.isArray(files)) {
    files = {
      checks: [{ files }]
    }
  }

  await calc(pluginList, files, undefined)

  return files.checks.map(i => {
    const value: CheckResult = {}
    for (const prop of ['size', 'time', 'runTime', 'loadTime'] as const) {
      if (typeof i[prop] !== 'undefined') {
        // @ts-expect-error
        value[prop] = i[prop]
      }
    }
    return value
  })
}
