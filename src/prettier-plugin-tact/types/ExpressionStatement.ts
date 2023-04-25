import { doc } from 'prettier';
const {  hardline } = doc.builders;

import { printComments } from '../libs/printer-helpers';

const ExpressionStatement = {
  print: ({ node, options, path, print }: any) => //JSON.stringify(node)
  {
    const parts = [];

    const parent = path.getParentNode();

    if (parent.type === 'IfStatement') {
      if (node.comments && node.comments.length) {
        const comments = printComments(node, path, options) as [];
        if (comments && comments.length) {
          parts.push(comments);
          parts.push(hardline);
        }
      }
    }

    parts.push(path.call(print, 'expression'));
    parts.push(";");

    return parts;
  }
};

export default ExpressionStatement;
