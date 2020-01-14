import { Logger, LoggerType, converter, styler } from '@sorg/log';
import { IToken } from 'vscode-textmate';

export interface Stats {
  cases: number;
  errors: number;
  failedCases: number;
  passedCases: number;
  tokens: number;
  failedTokens: number;
  passedTokens: number;
  lines: number;
  failedLines: number;
  passedLines: number;
}

const colors = {
  bg: '#222'
};

export const logger = new Logger<{
  invalid: LoggerType;
  failed: LoggerType;
  passed: LoggerType;
  stats: LoggerType;
}>({
  invalid: {
    styles: [
      { background: colors.bg, color: '#f22' },
      { background: colors.bg, color: '#fa0' },
      { background: colors.bg, color: '#ff0' }
    ],
    wrappers: [
      ['   [INVALID ', ']: '],
      ['', ' '],
      ['', ' ']
    ],
    customHandler: data => {
      let output = '';
      let length = 17;
      for (let i = 0; i < data.rawMessages.length; i++) {
        const msg = data.rawMessages[i];
        const con = converter(msg, { typeStyles: data.typeStyles });
        length += con.message.length;
        if (i === data.rawMessages.length - 1) {
          length += i;
          con.message += '  ';
        }

        output += styler(con, data.styles[i], data.wrappers[i]);
      }
      const line = ' '.repeat(length);
      output = `${styler(line, { background: colors.bg }, null)}\n${output}\n${styler(
        line,
        { background: colors.bg },
        null
      )}\n`;
      return output;
    }
  },
  failed: {
    styles: [],
    wrappers: [],
    customHandler: data => {
      const lines: RESLine[] = [];
      let longestLine = 27;
      const lineData: { token: IToken; line: string } = data.rawMessages[0] as any;
      lineData.line = lineData.line.replace(/ /g, '·');
      const cName = converter(data.rawMessages[1], { typeStyles: data.typeStyles });
      const cLine = converter(data.rawMessages[2], { typeStyles: data.typeStyles });
      const cToken = converter(data.rawMessages[3], { typeStyles: data.typeStyles });
      const cExpected = converter(data.rawMessages[4], { typeStyles: data.typeStyles });
      const cReceived = converter(data.rawMessages[5], { typeStyles: data.typeStyles });
      cExpected.message = cExpected.message.replace(/,/g, ' ');
      cReceived.message = cReceived.message.replace(/,/g, ' ');
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      longestLine += cName.message.length;
      longestLine += cLine.message.length;
      longestLine += cToken.message.length;
      const l1t: RESLine = {
        text: '',
        length: longestLine - 28
      };

      l1t.text += styler(`   [Failed]: `, { background: colors.bg, color: '#f00' }, null);
      l1t.text += styler(cName, { background: colors.bg, color: '#f24' }, null);
      l1t.text += styler(` Line:`, { background: colors.bg, color: '#02a' }, null);
      l1t.text += styler(cLine, { background: colors.bg, color: '#06f' }, null);
      l1t.text += styler(` Token:`, { background: colors.bg, color: '#02a' }, null);
      l1t.text += styler(cToken, { background: colors.bg, color: '#06f' }, null);
      l1t.text += styler('  ', { background: colors.bg }, null);
      lines.push(l1t);
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      let l2l = 6;
      const lineStart = lineData.line.slice(0, lineData.token.startIndex);
      const lineMiddle = lineData.line.slice(lineData.token.startIndex, lineData.token.endIndex);
      const lineEnd = lineData.line.slice(lineData.token.endIndex);
      l2l += lineStart.length;
      l2l += lineMiddle.length;
      l2l += lineEnd.length;
      longestLine = Math.max(longestLine, l2l);
      const l2: RESLine = {
        text: '',
        length: l2l
      };
      l2.text += styler(`      ${lineStart}`, { color: '#777', background: colors.bg }, null);
      l2.text += styler(lineMiddle, { color: '#fff', background: colors.bg }, null);
      l2.text += styler(lineEnd, { color: '#777', background: colors.bg }, null);
      lines.push(l2);

      const l3l = 19 + cExpected.message.length;
      longestLine = Math.max(longestLine, l3l);
      const l3: RESLine = {
        text: '',
        length: l3l
      };
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      l3.text += styler(`      Expected: `, { background: colors.bg, color: '#2a2' }, null);
      l3.text += styler(`${cExpected.message}   `, { background: colors.bg, color: '#0e0' }, null);
      lines.push(l3);

      const l4l = 19 + cReceived.message.length;
      longestLine = Math.max(longestLine, l4l);
      const l4: RESLine = {
        text: '',
        length: l4l
      };
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      l4.text += styler(`      Received: `, { background: colors.bg, color: '#a22' }, null);
      l4.text += styler(`${cReceived.message}   `, { background: colors.bg, color: '#e00' }, null);
      lines.push(l4);
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      return MapLines(lines, longestLine, styler);
    }
  },
  passed: {
    styles: [],
    wrappers: [],
    customHandler: data => {
      let length = 30;

      const cName = converter(data.rawMessages[1], { typeStyles: data.typeStyles });
      length += cName.message.length;
      const extended = data.rawMessages[0] !== null;
      if (extended) {
        const lineData: { token: IToken; line: string } = data.rawMessages[0] as any;
        lineData.line = lineData.line.replace(/ /g, '·');
        // tslint:disable-next-line: prefer-const
        var cLine = converter(data.rawMessages[2], { typeStyles: data.typeStyles });
        // tslint:disable-next-line: prefer-const
        var cToken = converter(data.rawMessages[3], { typeStyles: data.typeStyles });
        // tslint:disable-next-line: prefer-const
        var lineStart = lineData.line.slice(0, lineData.token.startIndex);
        // tslint:disable-next-line: prefer-const
        var lineMiddle = lineData.line.slice(lineData.token.startIndex, lineData.token.endIndex);
        // tslint:disable-next-line: prefer-const
        var lineEnd = lineData.line.slice(lineData.token.endIndex);

        length += cLine.message.length;
        length += cToken.message.length;

        length += lineStart.length;
        length += lineMiddle.length;
        length += lineEnd.length;
      } else {
        length -= 14;
      }

      let output = styler(`${getSpace(length)}\n`, { background: colors.bg }, null);

      output += styler(`   [Passed]: `, { background: colors.bg, color: '#0f0' }, null);
      output += styler(cName, { background: colors.bg, color: extended ? '#2c8' : '#c2f' }, null);
      if (extended) {
        output += styler(` Line:`, { background: colors.bg, color: '#02a' }, null);
        // @ts-ignore
        output += styler(cLine, { background: colors.bg, color: '#06f' }, null);
        output += styler(`Token:`, { background: colors.bg, color: '#02a' }, null);
        // @ts-ignore
        output += styler(cToken, { background: colors.bg, color: '#06f' }, null);
        output += styler('  ', { background: colors.bg }, null);
        // @ts-ignore
        output += styler(lineStart, { color: '#777', background: colors.bg }, null);
        // @ts-ignore
        output += styler(lineMiddle, { color: '#fff', background: colors.bg }, null);
        // @ts-ignore
        output += styler(`${lineEnd}   \n`, { color: '#777', background: colors.bg }, null);
      } else {
        output += styler(
          `${getSpace(length - (13 + cName.message.length))}\n`,
          { background: colors.bg },
          null
        );
      }
      output += styler(`${getSpace(length)}\n`, { background: colors.bg }, null);
      return output;
    }
  },
  stats: {
    styles: [],
    customHandler: data => {
      const stats: Stats = data.rawMessages[0] as any;

      const LINES: RESLine[] = [];
      let longestLine = 0;

      const maxWidth = Math.max(
        `${stats.cases}`.length,
        `${stats.errors}`.length,
        `${stats.failedCases}`.length,
        `${stats.failedLines}`.length,
        `${stats.failedTokens}`.length,
        `${stats.lines}`.length,
        `${stats.passedCases}`.length,
        `${stats.passedLines}`.length,
        `${stats.passedTokens}`.length,
        `${stats.tokens}`.length
      );

      const cases = AddPadding(stats.cases, maxWidth, `${stats.cases}`.length);
      const errors = AddPadding(stats.errors, maxWidth, `${stats.errors}`.length);
      const failedCases = AddPadding(stats.failedCases, maxWidth, `${stats.failedCases}`.length);
      const failedLines = AddPadding(stats.failedLines, maxWidth, `${stats.failedLines}`.length);
      const failedTokens = AddPadding(stats.failedTokens, maxWidth, `${stats.failedTokens}`.length);
      const lines = AddPadding(stats.lines, maxWidth, `${stats.lines}`.length);
      const passedCases = AddPadding(stats.passedCases, maxWidth, `${stats.passedCases}`.length);
      const passedLines = AddPadding(stats.passedLines, maxWidth, `${stats.passedLines}`.length);
      const passedTokens = AddPadding(stats.passedTokens, maxWidth, `${stats.passedTokens}`.length);
      const tokens = AddPadding(stats.tokens, maxWidth, `${stats.tokens}`.length);

      LINES.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      const l1l = 39 + `${cases}${errors}${failedCases}${errors}`.length;
      longestLine = Math.max(longestLine, l1l);
      const l1: RESLine = {
        text: '',
        length: l1l
      };
      l1.text += styler(`  Cases:  ${cases}`, { color: '#82f', background: colors.bg }, null);
      l1.text += styler(` Passed: ${passedCases}`, { color: '#2f2', background: colors.bg }, null);
      l1.text += styler(
        ` Failed: ${failedCases}`,
        { color: stats.failedCases === 0 ? '#0af' : '#f00', background: colors.bg },
        null
      );
      l1.text += styler(
        ` Errors: ${errors}  `,
        { color: stats.errors === 0 ? '#855' : '#f00', background: colors.bg },
        null
      );

      LINES.push(l1);
      LINES.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      const l2l = 28 + `${lines}${failedLines}${passedLines}`.length;
      longestLine = Math.max(longestLine, l2l);
      const l2: RESLine = {
        text: '',
        length: l2l
      };
      l2.text += styler(`  Lines:  ${lines}`, { color: '#82f', background: colors.bg }, null);
      l2.text += styler(` Passed: ${passedLines}`, { color: '#2f2', background: colors.bg }, null);
      l2.text += styler(
        ` Failed: ${failedLines}`,
        { color: stats.failedLines === 0 ? '#0af' : '#f00', background: colors.bg },
        null
      );
      LINES.push(l2);

      LINES.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      const l3l = 28 + `${tokens}${failedTokens}${passedTokens}`.length;
      longestLine = Math.max(longestLine, l3l);
      const l3: RESLine = {
        text: '',
        length: l3l
      };
      l3.text += styler(`  Tokens: ${tokens}`, { color: '#82f', background: colors.bg }, null);
      l3.text += styler(` Passed: ${passedTokens}`, { color: '#2f2', background: colors.bg }, null);
      l3.text += styler(
        ` Failed: ${failedTokens}`,
        { color: stats.failedTokens === 0 ? '#0af' : '#f00', background: colors.bg },
        null
      );
      LINES.push(l3);

      LINES.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      const success = stats.failedCases === 0 && stats.errors === 0;

      const EndingText = success ? 'Success' : 'Failed ';

      const subEndText = EndingText.length;
      return (
        MapLines(LINES, longestLine, styler) +
        styler(
          `${getSpace(Math.round((longestLine - subEndText) / 2))}\u001B[1m${EndingText}${getSpace(
            Math.round((longestLine - subEndText - (longestLine % 2 === 1 ? 0 : 1)) / 2)
          )}\n${getSpace(longestLine)}`,
          { color: success ? '#0f0' : '#f00', background: '#111' },
          null
        )
      );
    }
  }
});

function getSpace(length: number) {
  if (Math.sign(length) === -1) {
    return '';
  }
  return ' '.repeat(length);
}
function MapLines(lines: RESLine[], longestLine: number, styler: any) {
  return lines
    .map(v => {
      if (!v.length) {
        v.text = styler(`${getSpace(longestLine)}\n`, { background: colors.bg }, null);
      } else if (v.length < longestLine) {
        v.text += styler(`${getSpace(longestLine - v.length)}\n`, { background: colors.bg }, null);
      } else {
        v.text += '\n';
      }
      return v.text;
    })
    .join('');
}
interface RESLine {
  text: string;
  length?: number;
}

function AddPadding(input: number | string, maxWidth: number, width: number) {
  return `${input}${getSpace(maxWidth - width)}`;
}
