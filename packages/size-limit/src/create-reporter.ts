import bytes from 'bytes-iec'
import { join } from 'node:path'
import readline from 'node:readline'
import pc from 'picocolors'

import type { Config } from './index.js'

const { bgGreen, bgRed, black, bold, gray, green, red, yellow } = pc

type Reporter = {
  error: (err: Error) => void
  results: (plugins: { has(type: string): boolean }, config: Config) => void
}

function createJsonReporter(process: NodeJS.Process): Reporter {
  function print(data: unknown): void {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
  }

  return {
    error(err: Error) {
      print({ error: err.stack })
    },

    results(_plugins: { has(type: string): boolean }, config: Config) {
      print(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config.checks.map((i: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const result: any = { name: i.name }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof i.passed !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            result.passed = i.passed
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof i.size !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            result.size = i.size
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof i.limit !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            result.sizeLimit = i.sizeLimit
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof i.runTime !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            result.running = i.runTime
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof i.loadTime !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            result.loading = i.loadTime
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return result
        })
      )
    }
  }
}

function getFixText(prefix: string, config: Config): string {
  if (config.configPath) {
    if (config.configPath.endsWith('package.json')) {
      prefix += ` in ${bold('"size-limit"')} section of `
    } else {
      prefix += ' at '
    }
    prefix += bold(config.configPath)
  }

  return prefix
}

function createHumanReporter(
  process: NodeJS.Process,
  isSilentMode = false
): Reporter {
  let output = ''

  function print(...lines: string[]): void {
    const value = `  ${lines.join('\n  ')}\n`
    output += value
    process.stdout.write(value)
  }

  function formatBytes(size: number): string {
    return bytes.format(size, { unitSeparator: ' ' }) || ''
  }

  function formatTime(seconds: number): string {
    return seconds >= 1
      ? `${Math.ceil(seconds * 10) / 10} s`
      : `${Math.ceil(seconds * 1000)} ms`
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.name === 'SizeLimitError') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const msg = String(err.message)
          .split('. ')
          .map((i: string) => i.replace(/\*([^*]+)\*/g, yellow('$1')))
          .join('.\n        ')
        process.stderr.write(`${bgRed(black(' ERROR '))} ${red(msg)}\n`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (err.example) {
          process.stderr.write(
            '\n' +
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              String(err.example)
                .replace(/("[^"]+"):/g, `${green('$1')}:`)
                .replace(/: ("[^"]+")/g, `: ${yellow('$1')}`)
          )
        }
      } else {
        process.stderr.write(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `${bgRed(black(' ERROR '))} ${red(String(err.stack))}\n`
        )
      }
    },

    results(plugins, config) {
      print('')
      for (const check of config.checks) {
        if (
          (check.passed && config.hidePassed && !isSilentMode) ||
          (isSilentMode && check.passed !== false)
        ) {
          continue
        }

        const unlimited = typeof check.passed === 'undefined'
        const rows = []

        if (config.checks.length > 1) {
          print(bold(check.name))
        }

        if (check.missed) {
          print(red(`Size Limit can't find files at ${String(check.path)}`))
          continue
        }

        let sizeNote
        const bundled = plugins.has('webpack') || plugins.has('esbuild')
        if (check.config) {
          sizeNote = 'with given webpack configuration'
        } else if (bundled && check.gzip === true) {
          sizeNote = 'with all dependencies, minified and gzipped'
        } else if (bundled && check.brotli === false) {
          sizeNote = 'with all dependencies and minified'
        } else if (bundled) {
          sizeNote = 'with all dependencies, minified and brotlied'
        } else if (plugins.has('file') && check.gzip === true) {
          sizeNote = 'gzipped'
        } else if (plugins.has('file') && check.brotli !== false) {
          sizeNote = 'brotlied'
        }
        let sizeString = check.size !== undefined ? formatBytes(check.size) : ''

        if (typeof check.timeLimit !== 'undefined') {
          if (check.passed === false) {
            print(red('Total time limit has exceeded'))
          }
          rows.push(['Time limit', formatTime(check.timeLimit)])
        }
        if (typeof check.sizeLimit !== 'undefined') {
          let sizeLimitString = formatBytes(check.sizeLimit)
          if (check.passed === false) {
            if (sizeLimitString === sizeString) {
              sizeLimitString = `${check.sizeLimit} B`
              sizeString = `${check.size ?? 0} B`
            }
            if (check.size !== undefined) {
              const diff = formatBytes(check.size - check.sizeLimit)
              print(red(`Package size limit has exceeded by ${diff}`))
            }
            if (check.message) {
              print(check.message)
            }
          } else if (
            check.highlightLess &&
            check.size !== undefined &&
            check.size < check.sizeLimit
          ) {
            const diff = formatBytes(check.sizeLimit - check.size)
            print(bgGreen(black(`Package size is ${diff} less than limit`)))
          }
          rows.push(['Size limit', sizeLimitString])
        }

        if (typeof check.size !== 'undefined') {
          rows.push(['Size', sizeString, sizeNote])
        }
        if (typeof check.loadTime !== 'undefined') {
          const description = check.time?.loadingMessage || 'on slow 3G'
          rows.push(['Loading time', formatTime(check.loadTime), description])
        }
        if (typeof check.runTime !== 'undefined') {
          const totalTimeRows: [string, string, string?][] = [
            ['Running time', formatTime(check.runTime), 'on Snapdragon 410']
          ]
          if (check.totalTime !== undefined) {
            totalTimeRows.push(['Total time', formatTime(check.totalTime)])
          }
          rows.push(...totalTimeRows)
        }

        const max0 = Math.max(...rows.map(row => row[0]?.length ?? 0))
        const max1 = Math.max(...rows.map(row => row[1]?.length ?? 0))

        for (let [name, value, note] of rows) {
          if (!name || !value) continue
          let str = `${`${name}:`.padEnd(max0 + 1)} `
          if (note) value = value.padEnd(max1)
          value = bold(value)
          if (unlimited || name.includes('Limit')) {
            str += value
          } else if (check.passed) {
            str += green(value)
          } else {
            str += red(value)
          }
          if (note) {
            str += ` ${gray(note)}`
          }
          print(str)
        }
        print('')
      }

      if (config.failed) {
        const fix = getFixText('Try to reduce size or increase limit', config)
        print(yellow(fix))
      }

      if (plugins.has('webpack') && config.saveBundle) {
        const statsFilepath = join(config.saveBundle, 'stats.json')
        print(`Webpack Stats file was saved to ${statsFilepath}`)
        print('You can review it using https://webpack.github.io/analyse')
      }

      // clean the blank line in silent mode if the output is empty
      if (isSilentMode && !output.trim()) {
        readline.moveCursor(process.stdout, 0, -1)
        readline.clearLine(process.stdout, 0)
      }
    }
  }
}

export default (
  process: Partial<NodeJS.Process>,
  isJSON: boolean,
  isSilentMode?: boolean
): Reporter => {
  if (isJSON) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return createJsonReporter(process as NodeJS.Process)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return createHumanReporter(process as NodeJS.Process, isSilentMode)
  }
}
