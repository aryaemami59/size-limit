const MESSAGES = {
  argWithoutAnalyzer: (
    arg: string,
    bundler: string,
    analyzer = `${bundler}-${arg}`
  ) =>
    `Argument *--${arg}* works only with *@size-limit/${bundler}* plugin` +
    ` and *@size-limit/${analyzer}* plugin. You can add Bundle ` +
    `Analyzer to you own bundler.`,
  argWithoutAnotherArg: (arg: string, anotherArg: string) =>
    `Argument *--${arg}* works only with *--${anotherArg}* argument`,
  argWithoutParameter: (arg: string, parameter: string) =>
    `Missing parameter *${parameter}* for *--${arg}* argument`,
  argWithoutPlugins: (arg: string, mod1: string, mod2: string) =>
    `Argument *--${arg}* needs *@size-limit/${mod1}* ` +
    `or *@size-limit/${mod2}* plugin`,
  bundleDirNotEmpty: (dir: string) =>
    `The directory *${dir}* is not empty. ` +
    'Pass *--clean-dir* if you want to remove it',
  cmdError: (cmd: string, error?: string) =>
    error ? `${cmd} error: ${error}` : `${cmd} error`,
  emptyConfig: () => 'Size Limit config must *not be empty*',
  entryNotString: () =>
    'The *entry* in Size Limit config ' +
    'must be *a string* or *an array of strings*',
  missedPlugin: (mod: string) =>
    `Add *@size-limit/${mod}* plugin to Size Limit`,
  missingPackage: (pkg: string, usage: string) =>
    `*${pkg}* package is required for ${usage}. ` +
    `Install it with *npm install --save-dev ${pkg}* or *pnpm add -D ${pkg}*`,
  multiPluginlessConfig: (opt: string, mod1: string, mod2: string) =>
    `Config option *${opt}* needs *@size-limit/${mod1}* ` +
    `or *@size-limit/${mod2}* plugin`,
  noArrayConfig: () => 'Size Limit config must contain *an array*',
  noConfig: () => 'Create Size Limit config in *package.json*',
  noObjectCheck: () => 'Size Limit config array should contain *only objects*',
  noPackage: () =>
    'Size Limit didn’t find *package.json*. ' +
    'Create npm package and run Size Limit there.',
  pathNotString: () =>
    'The *path* in Size Limit config ' +
    'must be *a string* or *an array of strings*',
  pluginlessConfig: (opt: string, mod: string) =>
    `Config option *${opt}* needs *@size-limit/${mod}* plugin`,
  timeWithoutPlugin: () => 'Add *@size-limit/time* plugin to use time limit',
  unknownArg: (arg: string) =>
    `Unknown argument *${arg}*. Check command for typo and read docs.`,
  unknownEntry: (entry: string) =>
    `Size Limit didn't find *${entry}* entry in the custom bundler config`,
  unknownOption: (opt: string) =>
    `Unknown option *${opt}* in config. Check Size Limit docs and version.`
}

type MessageType = keyof typeof MESSAGES

const ADD_CONFIG_EXAMPLE: Record<string, boolean> = {
  emptyConfig: true,
  noArrayConfig: true,
  noConfig: true,
  noObjectCheck: true,
  pathNotString: true
}

export class SizeLimitError extends Error {
  example?: string

  constructor(type: MessageType, ...args: any[]) {
    super((MESSAGES[type] as any)(...args))
    this.name = 'SizeLimitError'
    if (ADD_CONFIG_EXAMPLE[type]) {
      this.example =
        '  "size-limit": [\n' +
        '    {\n' +
        '      "path": "dist/bundle.js",\n' +
        '      "limit": "10 kB"\n' +
        '    }\n' +
        '  ]\n'
    }
  }
}
