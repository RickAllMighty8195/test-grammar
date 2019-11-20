import { TestGrammar } from '.';

new TestGrammar(
  JSON.stringify({
    scopeName: 'source.test',
    name: 'test',
    patterns: [
      {
        begin: '@',
        end: '$\\n?|(?=\\s|,|\\(|\\)|\\[|>)',
        name: 'at',
        patterns: [
          {
            match: '.*',
            name: 'name'
          }
        ]
      },
      {
        begin: '\\*\\*',
        end: '\\*\\*',
        name: 'bold',
        patterns: [
          {
            match: '[A-z]+',
            name: 'text'
          },
          {
            match: '\\d+',
            name: 'number'
          },
          {
            match: ' *',
            name: 'whitespace'
          }
        ]
      }
    ]
  }),
  { useSourceAsFile: true },
  run => {
    run(
      'test',
      `@syler
**text 0**`,
      `at|at name
bold|bold text|bold whitespace|bold number|bold`
    );
  }
);
