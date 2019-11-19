import { Logger, LoggerType } from '@sorg/log';
import { IToken } from 'vscode-textmate';
export const logger = new Logger<{
  invalid: LoggerType;
  failed: LoggerType;
  passed: LoggerType;
}>({
  invalid: {
    styles: [
      { background: '#222', color: '#f22' },
      { background: '#222', color: '#fa0' },
      { background: '#222', color: '#ff0' }
    ],
    wrappers: [
      ['   [INVALID ', ']: '],
      ['', ' '],
      ['', ' ']
    ],
    customHandler: (data, converter, styler) => {
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
      output = `\n${styler(line, { background: '#222' }, null)}\n${output}\n${styler(
        line,
        { background: '#222' },
        null
      )}`;
      throw output;
    }
  },
  failed: {
    styles: [],
    wrappers: [],
    customHandler: (data, converter, styler) => {
      const lines: RESLine[] = [];
      let longestLine = 27;
      const lineData: { token: IToken; line: string } = data.rawMessages[0] as any;
      lineData.line = lineData.line.trim().replace(/ /g, '·');
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
        length: longestLine
      };

      l1t.text += styler(`   [Failed]: `, { background: '#222', color: '#f00' }, null);
      l1t.text += styler(cName, { background: '#222', color: '#f24' }, null);
      l1t.text += styler(` Line:`, { background: '#222', color: '#02a' }, null);
      l1t.text += styler(cLine, { background: '#222', color: '#06f' }, null);
      l1t.text += styler(`Token:`, { background: '#222', color: '#02a' }, null);
      l1t.text += styler(cToken, { background: '#222', color: '#06f' }, null);
      l1t.text += styler('  ', { background: '#222' }, null);
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
      l2.text += styler(`      ${lineStart}`, { color: '#777', background: '#222' }, null);
      l2.text += styler(lineMiddle, { color: '#fff', background: '#222' }, null);
      l2.text += styler(lineEnd, { color: '#777', background: '#222' }, null);
      lines.push(l2);

      const l3l = 19 + cExpected.message.length;
      longestLine = Math.max(longestLine, l3l);
      const l3: RESLine = {
        text: '',
        length: l3l
      };
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      l3.text += styler(`      Expected: `, { background: '#222', color: '#2a2' }, null);
      l3.text += styler(`${cExpected.message}   `, { background: '#222', color: '#0e0' }, null);
      lines.push(l3);

      const l4l = 19 + cReceived.message.length;
      longestLine = Math.max(longestLine, l4l);
      const l4: RESLine = {
        text: '',
        length: l4l
      };
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });
      l4.text += styler(`      Received: `, { background: '#222', color: '#a22' }, null);
      l4.text += styler(`${cReceived.message}   `, { background: '#222', color: '#e00' }, null);
      lines.push(l4);
      lines.push({ text: 'EMPTY_LINE_TEST_GRAMMAR' });

      return lines
        .map(v => {
          if (!v.length) {
            v.text = styler(`${getSpace(longestLine)}\n`, { background: '#222' }, null);
          } else if (v.length < longestLine) {
            v.text += styler(`${getSpace(longestLine - v.length)}\n`, { background: '#222' }, null);
          } else {
            v.text += '\n';
          }
          return v.text;
        })
        .join('');
    }
  },
  passed: {
    styles: [],
    wrappers: [],
    customHandler: (data, converter, styler) => {
      let length = 30;
      const lineData: { token: IToken; line: string } = data.rawMessages[0] as any;
      lineData.line = lineData.line.trim().replace(/ /g, '·');
      const cName = converter(data.rawMessages[1], { typeStyles: data.typeStyles });
      const cLine = converter(data.rawMessages[2], { typeStyles: data.typeStyles });
      const cToken = converter(data.rawMessages[3], { typeStyles: data.typeStyles });

      const lineStart = lineData.line.slice(0, lineData.token.startIndex);
      const lineMiddle = lineData.line.slice(lineData.token.startIndex, lineData.token.endIndex);
      const lineEnd = lineData.line.slice(lineData.token.endIndex);

      length += cName.message.length;
      length += cLine.message.length;
      length += cToken.message.length;

      length += lineStart.length;
      length += lineMiddle.length;
      length += lineEnd.length;

      let output = styler(`${getSpace(length)}\n`, { background: '#222' }, null);

      output += styler(`   [Passed]: `, { background: '#222', color: '#0f0' }, null);
      output += styler(cName, { background: '#222', color: '#2c8' }, null);
      output += styler(` Line:`, { background: '#222', color: '#02a' }, null);
      output += styler(cLine, { background: '#222', color: '#06f' }, null);
      output += styler(`Token:`, { background: '#222', color: '#02a' }, null);
      output += styler(cToken, { background: '#222', color: '#06f' }, null);
      output += styler('  ', { background: '#222' }, null);
      output += styler(lineStart, { color: '#777', background: '#222' }, null);
      output += styler(lineMiddle, { color: '#fff', background: '#222' }, null);
      output += styler(`${lineEnd}   \n`, { color: '#777', background: '#222' }, null);
      output += styler(`${getSpace(length)}\n`, { background: '#222' }, null);
      return output;
    }
  }
});
function getSpace(length: number) {
  return ' '.repeat(length);
}
interface RESLine {
  text: string;
  length?: number;
}
