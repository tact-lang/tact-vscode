import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const Conditional = {
  print: ({ path, print }: any) =>
    group([
      path.call(print, 'condition'),
      indent([
        line,
        '? ',
        path.call(print, 'trueExpression'),
        line,
        ': ',
        path.call(print, 'falseExpression')
      ])
    ])
};

export default Conditional;
