import { printSeparatedList } from '../libs/printer-helpers';

const parameters = (node: any, path: any, print: any) =>
  node.parameters
    ? [
        node.kind || '',
        '(',
        printSeparatedList(path.map(print, 'parameters')),
        ') '
      ]
    : '';

const CatchClause = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    'catch ',
    parameters(node, path, print),
    path.call(print, 'body')
  ]
};

export default CatchClause;
