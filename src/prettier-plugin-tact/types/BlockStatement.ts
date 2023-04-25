import { doc } from 'prettier';
const {  hardline, indent } = doc.builders;

import { printComments, printPreservingEmptyLines } from '../libs/printer-helpers';

const BlockStatement = {
  print: ({ node, options, path, print }: any) =>
    // if block is empty, just return the pair of braces
    node.body.length === 0 && !node.comments
      ? '{}'
      : [
          '{',
          indent([
            hardline,
            printPreservingEmptyLines(path, 'body', options, print),
            printComments(node, path, options)
          ]),
          hardline,
          '}'
        ]
};

export default BlockStatement;
