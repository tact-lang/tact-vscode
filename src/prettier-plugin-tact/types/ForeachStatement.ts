import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const printBody = (node: any, path: any, print: any) =>
  node.body.type === 'BlockStatement'
    ? [' ', path.call(print, 'body')]
    : group(indent([line, path.call(print, 'body')]));

const ForeachStatement = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    'foreach (',
    path.call(print, 'key'),
    ',',
    ' ',
    path.call(print, 'value'),
    ' ',
    'in',
    ' ',
    path.call(print, 'mapName'),
    ')',
    printBody(node, path, print)
  ]
};

export default ForeachStatement;
