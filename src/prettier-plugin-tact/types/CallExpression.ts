import { doc } from 'prettier';
const { group, indentIfBreak, label, softline } = doc.builders;

import { printSeparatedList } from '../libs/printer-helpers';


const printArguments = (path: any, print: any) =>
  printSeparatedList(path.map(print, 'arguments'), {
    firstSeparator: "",
    lastSeparator: [softline, ')'],
    grouped: true
  });

let groupIndex = 0;
const CallExpression = {
  print: ({ node, path, print, options }: any) => {
    let expressionDoc = path.call(print, 'callee');
    let argumentsDoc: any = [')'];

    if (node.arguments && node.arguments.length > 0) {
        argumentsDoc = printArguments(path, print);
    }

    // If we are at the end of a MemberAccessChain we should indent the
    // arguments accordingly.
    if (expressionDoc.type === 'Identifier') {
      expressionDoc = group(expressionDoc.contents, {
        id: Symbol(`CallExpression.expression-${groupIndex}`)
      });

      groupIndex += 1;

      argumentsDoc = indentIfBreak(argumentsDoc, {
        groupId: expressionDoc.id
      });
      // We wrap the expression in a label in case there is an IndexAccess or
      // a CallExpression following this IndexAccess.
      return label('MemberAccessChain', [expressionDoc, '(', argumentsDoc]);
    }

    return [expressionDoc, '(', argumentsDoc];
  }
};

export default CallExpression;
