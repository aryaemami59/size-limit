import bytes from 'bytes-iec'
import { lilconfig } from 'lilconfig'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { glob } from 'tinyglobby'

import { SizeLimitError } from './size-limit-error.js'

const require = createRequire(import.meta.url)

const OPTIONS = {
  brotli: 'file',
  compareWith: 'webpack',
  config: ['webpack', 'esbuild'],
  disableModuleConcatenation: 'webpack',
  entry: 'webpack',
  gzip: 'file',
  hidePassed: false,
  highlightLess: false,
  ignore: ['webpack', 'esbuild'],
  import: ['webpack', 'esbuild'],
  limit: true,
  message: true,
  modifyEsbuildConfig: 'esbuild',
  modifyWebpackConfig: 'webpack',
  module: true,
  name: true,
  path: true,
  running: 'time',
  time: 'time',
  uiReports: 'webpack',
  webpack: 'webpack'
}

function isStrings(value: any): boolean {
  if (!Array.isArray(value)) return false
  return value.every((i: any) => typeof i === 'string')
}

function isStringsOrUndefined(value: any): boolean {
  const type = typeof value
  return type === 'undefined' || type === 'string' || isStrings(value)
}

function endsWithMs(value: any): boolean {
  return / ?ms/i.test(value)
}

function endsWithS(value: any): boolean {
  return / ?s/i.test(value)
}

function checkChecks(plugins: any, checks: any): void {
  if (!Array.isArray(checks)) {
    throw new SizeLimitError('noArrayConfig')
  }
  if (checks.length === 0) {
    throw new SizeLimitError('emptyConfig')
  }
  for (const check of checks) {
    if (typeof check !== 'object') {
      throw new SizeLimitError('noObjectCheck')
    }
    if (!isStringsOrUndefined(check.path)) {
      throw new SizeLimitError('pathNotString')
    }
    if (!isStringsOrUndefined(check.entry)) {
      throw new SizeLimitError('entryNotString')
    }
    for (const opt in check) {
      const available = OPTIONS[opt as keyof typeof OPTIONS]
      if (typeof available === 'string') {
        if (!plugins.has(available)) {
          throw new SizeLimitError('pluginlessConfig', opt, available)
        }
      } else if (Array.isArray(available)) {
        if (available.every(i => !plugins.has(i))) {
          throw new SizeLimitError('multiPluginlessConfig', opt, ...available)
        }
      } else if (available !== true) {
        throw new SizeLimitError('unknownOption', opt)
      }
    }
  }
}

function toAbsolute(file: string, cwd: string): string {
  return isAbsolute(file) ? file : join(cwd, file)
}

function toName(files: string[], cwd: string): string {
  return files
    .map((i: string) => (i.startsWith(cwd) ? relative(cwd, i) : i))
    .join(', ')
}

const dynamicImport = async (filePath: string): Promise<any> =>
  (await import(pathToFileURL(filePath).href)).default

const tsLoader = async (filePath: string): Promise<any> => {
  let jiti: any
  try {
    jiti = (await import('jiti')).createJiti(fileURLToPath(import.meta.url), {
      interopDefault: false
    })
    /* c8 ignore next 6 */
  } catch (error: any) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new SizeLimitError('missingPackage', 'jiti', 'TypeScript config')
    }
    throw error
  }

  const config = await jiti.import(filePath, { default: true })

  return config
}

export default async function getConfig(
  plugins: any,
  process: any,
  args: any,
  pkg: any
): Promise<any> {
  const config: any = {
    cwd: process.cwd()
  }
  if (args.why) {
    config.project = pkg.packageJson.name
    config.why = args.why
  }

  if (args.compareWith) {
    config.compareWith = toAbsolute(args.compareWith, process.cwd())
  }

  if (args.saveBundle) {
    config.saveBundle = toAbsolute(args.saveBundle, process.cwd())
  }
  if (args.cleanDir) {
    config.cleanDir = args.cleanDir
  }
  if (args.hidePassed) {
    config.hidePassed = args.hidePassed
  }
  if (args.highlightLess) {
    config.highlightLess = args.highlightLess
  }

  if (args.files.length > 0) {
    config.checks = [{ files: args.files }]
  } else {
    const explorer = lilconfig('size-limit', {
      loaders: {
        '.cjs': dynamicImport,
        '.cts': tsLoader,
        '.js': dynamicImport,
        '.mjs': dynamicImport,
        '.mts': tsLoader,
        '.ts': tsLoader
      },
      searchPlaces: [
        'package.json',
        '.size-limit.json',
        '.size-limit',
        '.size-limit.js',
        '.size-limit.mjs',
        '.size-limit.cjs',
        '.size-limit.ts',
        '.size-limit.mts',
        '.size-limit.cts'
      ]
    })
    const result = args.config?.trim()
      ? await explorer.load(resolve(args.config.trim()))
      : await explorer.search(process.cwd())

    // console.dir(result, {depth: null})

    if (result === null) throw new SizeLimitError('noConfig')
    checkChecks(plugins, result.config)

    config.configPath = relative(process.cwd(), result.filepath)
    config.cwd = dirname(result.filepath)
    config.checks = await Promise.all(
      result.config.map(
        async (check: {
          path: string | string[]
          entry: string | string[]
          files: string | string[]
        }) => {
          const processed = { ...check }
          if (check.path) {
            const patterns = Array.isArray(check.path)
              ? check.path
              : [check.path]
            processed.files = await glob(patterns, { cwd: config.cwd })
          } else if (!check.entry) {
            if (pkg.packageJson.main) {
              processed.files = [
                require.resolve(join(dirname(pkg.path), pkg.packageJson.main))
              ]
            } else {
              processed.files = [join(dirname(pkg.path), 'index.js')]
            }
          }
          return processed
        }
      )
    )
  }

  const peer = Object.keys(pkg.packageJson.peerDependencies || {})
  for (const check of config.checks) {
    if (peer.length > 0) check.ignore = peer.concat(check.ignore || [])
    if (check.entry && !Array.isArray(check.entry)) check.entry = [check.entry]
    if (!check.name) check.name = toName(check.entry || check.files, config.cwd)
    if (args.limit) check.limit = args.limit
    if (check.limit) {
      if (endsWithMs(check.limit)) {
        check.timeLimit = parseFloat(check.limit) / 1000
      } else if (endsWithS(check.limit)) {
        check.timeLimit = parseFloat(check.limit)
      } else {
        check.sizeLimit = bytes.parse(check.limit)
      }
      if (check.timeLimit && !plugins.has('time')) {
        throw new SizeLimitError('timeWithoutPlugin')
      }
    }

    // console.dir(config, {depth: null})
    if (config.highlightLess) check.highlightLess = true
    if (/\sB$|\dB$/.test(check.limit)) check.highlightLess = true
    if (check.files) {
      check.files = check.files.map((i: string) => toAbsolute(i, config.cwd))
    }
    if (check.config) check.config = toAbsolute(check.config, config.cwd)
    if (typeof check.import === 'string') {
      check.import = {
        [check.files[0]]: check.import
      }
    }
    if (check.import) {
      const imports: any = {}
      for (const i in check.import) {
        if (peer.includes(i)) {
          check.ignore = check.ignore.filter((j: string) => j !== i)
          imports[require.resolve(i, config.cwd)] = check.import[i]
        } else {
          imports[toAbsolute(i, config.cwd)] = check.import[i]
        }
      }
      check.import = imports
    }
    if (check.time) {
      let { latency, networkSpeed } = check.time
      if (latency) {
        if (endsWithMs(latency)) {
          check.time.latency = parseFloat(latency) / 1000
        } else {
          check.time.latency = parseFloat(latency) || 0
        }
      }
      if (networkSpeed) {
        check.time.networkSpeed = bytes.parse(networkSpeed)
      }
    }
  }

  // console.dir(config, { depth: null })

  return config
}
