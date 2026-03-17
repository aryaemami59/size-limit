import spawn from 'cross-spawn'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const BIN_PATH = join(__dirname, '../bin.js')

function run(args: string[], env = {}) {
  const cli = spawn(BIN_PATH, args, { env: { ...process.env, ...env } })
  return new Promise<{ code: number; out: string }>(resolve => {
    let out = ''
    if (cli.stdout) {
      cli.stdout.on('data', data => {
        out += data.toString()
      })
    }
    if (cli.stderr) {
      cli.stderr.on('data', data => {
        out += data.toString()
      })
    }
    cli.on('close', code => {
      resolve({ code: code ?? 0, out })
    })
  })
}

it('passes process to runner', async () => {
  const res = await run(['--version'], {
    TRAVIS: '1',
    TRAVIS_JOB_NUMBER: '1.1'
  })
  expect(res.out).toMatch(/size-limit \d+.\d+.\d+/)
  expect(res.code).toBe(0)
})
