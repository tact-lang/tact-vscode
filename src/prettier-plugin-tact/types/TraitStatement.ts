import { doc } from 'prettier';
const { group, line, hardline } = doc.builders;

import {  printComments,
          printPreservingEmptyLines,
          printSeparatedItem,
          printSeparatedList } from '../libs/printer-helpers';

const interfaceId = (node: any, path: any, print: any) => {
  let out = node.id_Interface && node.id_Interface.length > 0
    ? [
        '@interface',
        '(',
        '"',
        node.id_Interface.map((item: any) => {
          return item == "." ? "." : item.name;
        }),
        '"',
        ')',
        hardline
      ]
    : "";
  return out;
}

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

const TraitStatement = {
  print: ({ node, options, path, print }: any) => [
    group([
      interfaceId(node, path, print),
      'trait ', 
      node.name,
      inheritance(node, path, print),
      '{'
    ]),
    body(node, path, options, print),
    '}'
  ]
};

export default TraitStatement;
