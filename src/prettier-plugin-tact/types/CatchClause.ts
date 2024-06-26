import { printSeparatedList } from '../libs/printer-helpers';

const param = (node: any, path: any, print: any) =>
  node.param
    ? [
        '(',
        path.call(print, 'param'),
        ') '
      ]
    : '';

const CatchClause = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    'catch ',
    param(node, path, print),
    path.call(print, 'body')
  ]
};

export default CatchClause;
