import { doc } from 'prettier';
import { printSeparatedItem } from '../libs/printer-helpers';
const { group, indent, line } = doc.builders;

const printBody = (node: any, path: any, print: any) =>
  node.body.type === 'Block'
    ? [' ', path.call(print, 'body')]
    : group(indent([line, path.call(print, 'body')]));

const WhileStatement = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    'while (',
    printSeparatedItem(path.call(print, 'condition')),
    ')',
    printBody(node, path, print)
  ]
};

export default WhileStatement;
