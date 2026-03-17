import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, parse, resolve } from 'node:path'

export type PackageJson = {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  sizeLimitRoot?: boolean
}

async function readPkg(cwd: string): Promise<PackageJson> {
  const filePath = resolve(cwd, 'package.json')
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function findUp(
  name: string,
  cwd: string = ''
): Promise<string | undefined> {
  let directory = resolve(cwd)
  const { root } = parse(directory)

  while (true) {
    const foundPath = resolve(directory, name)

    if (existsSync(foundPath)) {
      return foundPath
    }

    if (directory === root) {
      return undefined
    }

    directory = dirname(directory)
  }
}

export type Package = {
  packageJson: PackageJson
  path: string
}

export default async (cwd: string): Promise<Package | undefined> => {
  const filePath = await findUp('package.json', cwd)

  if (!filePath) {
    return undefined
  }

  return {
    packageJson: await readPkg(dirname(filePath)),
    path: filePath
  }
}
