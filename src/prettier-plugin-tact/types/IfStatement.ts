import { doc } from 'prettier';
const { hardline } = doc.builders;

import { printComments, printSeparatedItem } from '../libs/printer-helpers';

const printConsequent = (node: any, path: any, print: any) => {
  return [' ', path.call(print, 'consequent')];
};

const printAlternate = (node: any, path: any, print: any) => [' ', path.call(print, 'alternate')];

const printElse = (node: any, path: any, print: any, commentsBetweenIfAndElse: any) => {
  if (node.alternate != null) {
    return [
      ' ',
      'else',
      printAlternate(node, path, print)
    ];
  }
  return '';
};

const IfStatement = {
  print: ({ node, options, path, print }: any) => {
    const comments = node.comments || [];
    const commentsBetweenIfAndElse = comments.filter(
      (comment: any) => !comment.leading && !comment.trailing
    );

    const parts = [];

    parts.push('if (', printSeparatedItem(path.call(print, 'test')), ')');

    parts.push(printConsequent(node, path, print));
    if (commentsBetweenIfAndElse.length && node.falseBody) {
      parts.push(hardline);
      parts.push(printComments(node, path, options));
    }
    parts.push(printElse(node, path, print, commentsBetweenIfAndElse));
    
    return parts;
  }
};

export default IfStatement;
