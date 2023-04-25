import { doc, util } from 'prettier';
const { dedent, group, indent, line } = doc.builders;
const { getNextNonSpaceNonCommentCharacterIndex } = util;

import { printComments, printSeparatedItem, printSeparatedList } from '../libs/printer-helpers';

const parameters = (parametersType: any, node: any, path: any, print: any, options: any) => {
  if (node[parametersType] && node[parametersType].length > 0 && !Array.isArray(node[parametersType][0])) {
    return printSeparatedList(path.map(print, parametersType), {
      firstSeparator: "",
      lastSeparator: "",
      grouped: false
    });
  }
  if (node.comments && node.comments.length > 0) {
    // we add a check to see if the comment is inside the parentheses
    const parameterComments = printComments(
      node,
      path,
      options,
      (comment: any) =>
        options.originalText.charAt(
          getNextNonSpaceNonCommentCharacterIndex(
            options.originalText,
            comment,
            options.locEnd
          )
        ) === ')'
    ) as [];
    return parameterComments.length > 0
      ? printSeparatedItem(parameterComments)
      : '';
  }
  return '';
};

const body = (node: any, path: any, print: any) => (node.body ? path.call(print, 'body') : '');

const ReceiveDeclaration = {
  print: ({ node, path, print, options }: any) => //JSON.stringify(node)
  [
    group([
      'receive',
      '(',
      parameters('params', node, path, print, options),
      ')'
    ]),
    body(node, path, print)
  ]
};

export default ReceiveDeclaration;
