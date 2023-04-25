import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

export default {
  match: (op: any) =>
    [
      '=',
      '|=',
      '^=',
      '&=',
      '<<=',
      '>>=',
      '+=',
      '-=',
      '*=',
      '/=',
      '%='
    ].includes(op),
  print: (node: any, path: any, print: any) => [
    path.call(print, 'left'),
    ' ',
    node.operator,
    node.right.type === 'BinaryExpression'
      ? group(indent([line, path.call(print, 'right')]))
      : [' ', path.call(print, 'right')]
  ]
};
