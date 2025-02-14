import { readFileSync } from 'fs'
import path, { normalize } from 'path'
import oniguruma from 'vscode-oniguruma'
import { IGrammar, INITIAL, Registry } from 'vscode-textmate'
import { Expect, Options, Run, Text } from './interfaces'
import { logger, Stats } from './logger'
export class TestGrammar {
  private registry: Registry
  private grammar: IGrammar | null
  private scope: string
  private stats: Stats = {
    cases: 0,
    failedLines: 0,
    failedTokens: 0,
    lines: 0,
    passedLines: 0,
    passedTokens: 0,
    tokens: 0,
    errors: 0,
    failedCases: 0,
    passedCases: 0,
  }
  private options: Options = {
    logAllTokens: false,
    exitProcess: true,
    useSourceAsFile: false,
  }

  constructor(
    source: string,
    options: Partial<Options> | null,
    protected initFunc: (run: Run) => void
  ) {
    try {
      if (options) {
        this.SetOptions(options)
      }
      let file: any
      if (this.options.useSourceAsFile) {
        file = JSON.parse(source)
      } else {
        file = require(normalize(`${process.cwd()}/${source}`))
      }

      const wasmBin = readFileSync(
        path.join(
          __dirname,
          './node_modules/vscode-oniguruma/release/onig.wasm'
        )
      ).buffer
      const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
        return {
          createOnigScanner(patterns: any) {
            return new oniguruma.OnigScanner(patterns)
          },
          createOnigString(s: any) {
            return new oniguruma.OnigString(s)
          },
        }
      })

      this.scope = file.scopeName
      this.registry = new Registry({
        onigLib: vscodeOnigurumaLib,
        loadGrammar: () => {
          return file
        },
      })

      this.Init()
    } catch {
      if (this.options.useSourceAsFile) {
        logger.Log('invalid', 'JSON', 'Source is not valid Json.', source)
      } else {
        logger.Log(
          'invalid',
          'FILE',
          'Cannot Run test with invalid source file:',
          normalize(`${process.cwd()}/${source}`)
        )
      }
    }
  }

  private SetOptions(options: Partial<Options>) {
    const tempOptions: Options = {
      logAllTokens: this.getOption('logAllTokens', options) as any,
      useSourceAsFile: this.getOption('useSourceAsFile', options) as any,
      exitProcess: this.getOption('exitProcess', options) as any,
    }
    this.options = tempOptions
  }

  private getOption(name: keyof Options, options: Partial<Options>) {
    return options[name] !== undefined ? options[name] : this.options[name]
  }

  private async Init() {
    this.grammar = await this.registry.loadGrammar(this.scope)
    this.initFunc(this.run.bind(this))
    logger.Log('stats', this.stats as any)
    if (
      (this.options.exitProcess && this.stats.failedCases !== 0) ||
      (this.options.exitProcess && this.stats.errors !== 0)
    ) {
      process.exit(1)
    }
  }

  private transformText(text: Text): string[] {
    if (typeof text === 'string') {
      return text.split(/\n/)
    }
    return text
  }
  private transformExpect(expect: Expect): string[][][] {
    if (typeof expect === 'string') {
      if (expect.length === 0) {
        return [[[]]]
      }
      return expect.split(/\n/).map((val) => {
        if (val.length === 0) {
          return [[]]
        }
        return val.split(/\|/).map((v) => {
          if (v.length === 0) {
            return []
          }
          return v.split(/ /)
        })
      })
    }
    return expect
  }
  private run: Run = (name, text, expect, options?) => {
    if (!this.grammar) {
      logger.Log('invalid', 'CASE', name, 'could not load grammar')
      this.stats.errors++
      return
    }

    let resetOptions: null | Options = null
    if (options !== undefined) {
      resetOptions = this.options
      this.SetOptions(options)
    }
    const TEXT = this.transformText(text)
    const EXPECT = this.transformExpect(expect)
    if (TEXT.length !== EXPECT.length) {
      logger.Log(
        'invalid',
        'CASE',
        name,
        'parameter "text" and "expect" are expected to have the same number of lines/array length'
      )
      this.stats.errors++
      return
    }

    let ruleStack = INITIAL

    let failed = false

    for (let i = 0; i < TEXT.length; i++) {
      const line = TEXT[i]
      const lineTokens = this.grammar.tokenizeLine(line, ruleStack)
      let failedLine = false
      this.stats.lines++

      const max = Math.max(EXPECT[i].length, lineTokens.tokens.length)

      for (let j = 0; j < max; j++) {
        const token = lineTokens.tokens[j]
        this.stats.tokens++

        if (token === undefined) {
          logger.Log(
            'failed',
            { token: { endIndex: 0, startIndex: 0 }, line } as any,
            name,
            i,
            j,
            [this.scope, ...EXPECT[i][j]].toString(),
            'undefined'
          )
          this.stats.failedTokens++
          failedLine = true
          failed = true
          continue
        }

        if (EXPECT[i][j] === undefined) {
          logger.Log(
            'failed',
            { token, line } as any,
            name,
            i,
            j,
            'undefined',
            token.scopes.toString()
          )
          this.stats.failedTokens++
          failedLine = true
          failed = true
          continue
        }
        const expected = [this.scope, ...EXPECT[i][j]].toString()
        const passed = token.scopes.toString() === expected
        if (passed) {
          if (this.options.logAllTokens) {
            logger.Log('passed', { token, line } as any, name, i, j)
          }
          this.stats.passedTokens++
        } else {
          logger.Log(
            'failed',
            { token, line } as any,
            name,
            i,
            j,
            expected.toString(),
            token.scopes.toString()
          )
          failed = true
          failedLine = true
          this.stats.failedTokens++
        }
      }
      if (failedLine) {
        this.stats.failedLines++
      } else {
        this.stats.passedLines++
      }

      ruleStack = lineTokens.ruleStack
    }
    if (failed) {
      this.stats.failedCases++
    } else {
      logger.Log('passed', null as any, name)
      this.stats.passedCases++
    }
    if (resetOptions !== null) {
      this.SetOptions(resetOptions)
    }
    this.stats.cases++
  }
}
