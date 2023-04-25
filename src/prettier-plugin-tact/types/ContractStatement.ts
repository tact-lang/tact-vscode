import { doc } from 'prettier';
const { group, line, hardline } = doc.builders;

import {  printComments,
          printPreservingEmptyLines,
          printSeparatedItem,
          printSeparatedList } from '../libs/printer-helpers';

const inheritance = (node: any, path: any, print: any) =>
  node.is.length > 0
    ? [
        ' with',
        printSeparatedList(path.map(print, 'is'), {
          firstSeparator: line
        })
      ]
    : line;

const body = (node: any, path: any, options: any, print: any) =>
  node.body.length > 0 || node.comments
    ? printSeparatedItem(
        [
          printPreservingEmptyLines(path, 'body', options, print),
          printComments(node, path, options)
        ],
        { firstSeparator: hardline, grouped: false }
      )
    : '';

const ContractStatement = {
  print: ({ node, options, path, print }: any) => [
    group([
      'contract ', 
      node.name,
      inheritance(node, path, print),
      '{'
    ]),
    body(node, path, options, print),
    '}'
  ]
};

export default ContractStatement;
