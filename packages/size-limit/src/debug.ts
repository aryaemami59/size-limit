import type { Config } from './index.js'

type Args = {
  debug?: boolean
}

export default {
  error(process: NodeJS.Process, args: Args, config: Config) {
    if (args && args.debug) {
      process.stderr.write(`${JSON.stringify(config, null, 2)}\n`)
    }
  },

  results(process: NodeJS.Process, args: Args, config: Config) {
    if (args && args.debug) {
      process.stdout.write(`${JSON.stringify(config, null, 2)}\n`)
    }
  }
}
