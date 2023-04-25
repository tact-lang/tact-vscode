import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

import { printSeparatedItem } from '../libs/printer-helpers';

const printBody = (node: any, path: any, print: any) =>
  node.body.type === 'Block'
    ? [' ', path.call(print, 'body'), ' ']
    : group([indent([line, path.call(print, 'body')]), line]);

const DoWhileStatement = {
  print: ({ node, path, print }: any) => [
    'do',
    printBody(node, path, print),
    'while (',
    printSeparatedItem(path.call(print, 'condition')),
    ');'
  ]
};

export default DoWhileStatement;
