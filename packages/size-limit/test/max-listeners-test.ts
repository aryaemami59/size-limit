import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import run from '../src/run.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

process.argv = ['node', 'size-limit']
process.cwd = () =>
  join(__dirname, '..', '..', '..', 'fixtures', 'max-listeners')

run(process)
