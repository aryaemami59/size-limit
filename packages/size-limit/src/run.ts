import { createSpinner } from 'nanospinner'
import { watch } from 'node:fs/promises'
import { resolve } from 'node:path'

import calc from './calc.js'
import createHelp from './create-help.js'
import createReporter from './create-reporter.js'
import debug from './debug.js'
import getConfig from './get-config.js'
import loadPlugins, { type Plugins } from './load-plugins.js'
import parseArgs from './parse-args.js'
import readPkgUp, { type Package } from './read-pkg-up.js'
import { SizeLimitError } from './size-limit-error.js'

/* c8 ignore next 10 */
function throttle(fn: () => Promise<void>): () => void {
  let next: NodeJS.Timeout
  let running: Promise<void>
  return () => {
    clearTimeout(next)
    next = setTimeout(async () => {
      await running
      running = fn()
    }, 200)
  }
}

async function findPlugins(parentPkg: Package | undefined): Promise<Plugins> {
  const plugins = await loadPlugins(parentPkg)

  if (!parentPkg || !plugins.isEmpty) return plugins
  if (parentPkg.packageJson.sizeLimitRoot) {
    return plugins
  }

  const cwd = resolve(parentPkg.path, '..', '..')
  const pkg = await readPkgUp(cwd)

  return findPlugins(pkg)
}

export default async (
  process: Partial<NodeJS.Process> & Pick<NodeJS.Process, 'argv'>
): Promise<void> => {
  function hasArg(arg: string): boolean {
    return process.argv.includes(arg)
  }
  const isJsonOutput = hasArg('--json')
  const isSilentMode = hasArg('--silent')
  const reporter = createReporter(process, isJsonOutput, isSilentMode)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const help = createHelp(process as unknown as NodeJS.Process)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let args: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any

  try {
    if (hasArg('--version')) {
      help.showVersion()
      return
    }

    const cwd = typeof process.cwd === 'function' ? process.cwd() : ''
    const pkg = await readPkgUp(cwd)
    const plugins = await findPlugins(pkg)

    if (hasArg('--help')) {
      help.showHelp(plugins)
      return
    }

    if (!pkg?.packageJson) {
      throw new SizeLimitError('noPackage')
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    args = parseArgs(plugins, process.argv)

    if (plugins.isEmpty) {
      help.showMigrationGuide(pkg)
      process.exit?.(1)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config = await getConfig(plugins, process, args, pkg)

    const calcAndShow = async (): Promise<void> => {
      const outputFunc =
        isJsonOutput || isSilentMode ? undefined : createSpinner
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await calc(plugins, config, outputFunc)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-type-assertion
      debug.results(process as NodeJS.Process, args, config)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      reporter.results(plugins, config)
    }

    await calcAndShow()

    /* c8 ignore next 9 */
    if (hasArg('--watch')) {
      const watcher = watch(cwd, { recursive: true })
      const throttledCalcAndShow = throttle(calcAndShow)
      for await (const event of watcher) {
        if (event.filename && !event.filename.includes('node_modules')) {
          throttledCalcAndShow()
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if ((config.failed || config.missed) && !args.why) process.exit?.(1)
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-type-assertion
    debug.error(process as NodeJS.Process, args, config)
    reporter.error(e instanceof Error ? e : new Error(String(e)))
    process.exit?.(1)
  }
}
