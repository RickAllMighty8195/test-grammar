import { TestGrammar } from '.';

const a = new TestGrammar('../syntaxes/sass.language.json', run => {
  const text = [`.class`, 'margin: 200px'];

  run('THE TEST', text, [
    [['entity.other.attribute-name.class.css.sass'], ['entity.class']],
    [['a'], ['meta.property-list.css.sass']]
  ]);
});
