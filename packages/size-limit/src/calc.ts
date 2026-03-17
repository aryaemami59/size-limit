import type { Config } from './index.js'

type Plugin = {
  [key: string]: any
  list?: Plugin[]
}

type Plugins = {
  list: Plugin[]
}

type Spinner = {
  start: () => Spinner
  success: () => void
  error: () => void
}

export default async function calc(
  plugins: Plugins,
  config: Config,
  createSpinner?: ((text: string) => Spinner) | undefined
) {
  process.setMaxListeners(
    config.checks.reduce((a: number, i: any) => a + i.files.length, 1)
  )

  async function step(number: number) {
    for (const plugin of plugins.list) {
      let spinner
      if (plugin[`wait${number}`] && createSpinner) {
        spinner = createSpinner(plugin[`wait${number}`]).start()
      }
      if (plugin[`step${number}`])
        try {
          await Promise.all(
            config.checks.map(i => plugin[`step${number}`](config, i))
          )
        } catch (e) {
          if (spinner) spinner.error()
          throw e
        }
      if (spinner) spinner.success()
    }
  }

  async function callMethodForEachPlugin(methodName: string) {
    for (const plugin of plugins.list) {
      if (plugin[methodName]) {
        await Promise.all(config.checks.map(i => plugin[methodName](config, i)))
      }
    }
  }

  try {
    await callMethodForEachPlugin('before')
    for (let i = 0; i <= 100; i++) await step(i)
  } finally {
    await callMethodForEachPlugin('finally')
  }
  for (const check of config.checks) {
    if (
      typeof check.sizeLimit !== 'undefined' &&
      typeof check.size !== 'undefined'
    ) {
      check.passed = check.sizeLimit >= check.size
    }
    if (
      typeof check.timeLimit !== 'undefined' &&
      typeof check.totalTime !== 'undefined'
    ) {
      check.passed = check.timeLimit >= check.totalTime
    }
    if (check.files && !check.files.length && check.path) {
      check.missed = true
      check.sizeLimit = undefined
      check.timeLimit = undefined
    }
  }
  config.failed = config.checks.some((i: any) => i.passed === false)
  config.missed = config.checks.some((i: any) => i.missed === true)
}
