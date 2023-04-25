import { doc } from 'prettier';
const { group, hardline } = doc.builders;

import {  printComments,
          printPreservingEmptyLines,
          printSeparatedItem } from '../libs/printer-helpers';

const printBody = (node: any, path: any, options: any, print: any) =>
  node.body.length > 0 || node.comments
    ? printSeparatedItem(
        [
          printPreservingEmptyLines(path, 'body', options, print),
          printComments(node, path, options)
        ],
        { firstSeparator: hardline, grouped: true }
      )
    : '';

const Program = {
  print: ({ node, options, path, print }: any) => [
    printBody(node, path, options, print)
  ]
};

export default Program;
