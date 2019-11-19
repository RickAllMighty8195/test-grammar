import { Registry, INITIAL, IGrammar } from 'vscode-textmate';
import { logger } from './logger';

type TestGrammarExpect = string[][][] | string;
type TestGrammarText = string[] | string;

export class TestGrammar {
  private registry: Registry;
  private grammar: IGrammar;
  private scope: string;
  // TODO  Add Statistics as a class variable and print stats after init Func
  constructor(source: string, protected initFunc: (run: TestGrammar['run']) => void) {
    try {
      const file = require(source);
      this.scope = file.scopeName;
      this.registry = new Registry({
        loadGrammar: () => {
          return file;
        }
      });
      this.Init();
    } catch {
      logger.Log('invalid', '', 'Cannot Run test with invalid source file:', source);
    }
  }

  private async Init() {
    this.grammar = await this.registry.loadGrammar(this.scope);
    this.initFunc(this.run.bind(this));
    // TODO  Print stats
  }

  private transformText(text: TestGrammarText): string[] {
    if (typeof text === 'string') {
      return text.split(/\n/);
    }
    return text;
  }
  private transformExpect(expect: TestGrammarExpect): string[][][] {
    if (typeof expect === 'string') {
      return expect.split(/\n/).map(val => val.split(/\|/).map(v => v.split(/ /)));
    }
    return expect;
  }
  private run(name: string, text: TestGrammarText, expect: TestGrammarExpect) {
    const TEXT = this.transformText(text);
    const EXPECT = this.transformExpect(expect);
    let failed = false;
    if (text.length !== EXPECT.length) {
      logger.Log(
        'invalid',
        'CASE',
        name,
        'parameter "text" and "expect" are expected to have the same number of lines/array length'
      );
      return;
    }
    let ruleStack = INITIAL;

    for (let i = 0; i < TEXT.length; i++) {
      const line = TEXT[i];
      const lineTokens = this.grammar.tokenizeLine(line, ruleStack);
      // console.log(`\nTokenizing line: ${line}`);
      for (let j = 0; j < lineTokens.tokens.length; j++) {
        const token = lineTokens.tokens[j];
        if (EXPECT[i][j] === undefined) {
          failed = true;
          logger.Log('failed', { token, line } as any, name, i, j, 'undefined', token.scopes.toString());

          continue;
        }
        const expected = [this.scope, ...EXPECT[i][j]].toString();
        const passed = token.scopes.toString() === expected;
        if (passed) {
          logger.Log('passed', { token, line } as any, name, i, j);
        } else {
          logger.Log('failed', { token, line } as any, name, i, j, expected.toString(), token.scopes.toString());
        }
      }
      ruleStack = lineTokens.ruleStack;
    }
    return failed;
  }
}
