import { doc } from 'prettier';
import { printSeparatedItem, printSeparatedList } from '../libs/printer-helpers';
const { join, line } = doc.builders;

const returnParameters = (node: any, path: any, print: any) =>
  node.returnParameters
    ? [
        'returns (',
        printSeparatedList(path.map(print, 'returnParameters')),
        ')'
      ]
    : '';

const TryStatement = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  {
    let parts = [
      'try',
      printSeparatedItem(path.call(print, 'expression'), {
        firstSeparator: line as doc.builders.Softline
      })
    ];

    const formattedReturnParameters = returnParameters(node, path, print);
    if (formattedReturnParameters) {
      parts = parts.concat([formattedReturnParameters, ' ']);
    }

    parts = parts.concat([
      path.call(print, 'body'),
      ' ',
      join(' ', path.map(print, 'catchClauses'))
    ]);

    return parts;
  }
};

export default TryStatement;
