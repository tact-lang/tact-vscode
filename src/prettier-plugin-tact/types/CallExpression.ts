import { doc } from 'prettier';
const { group, indentIfBreak, label, softline } = doc.builders;

import { printSeparatedList } from '../libs/printer-helpers';


const printArguments = (path: any, print: any, bracketOut: any, bracketIn: any) =>
  printSeparatedList(path.map(print, 'arguments'), {
    firstSeparator: bracketIn == "{" ? softline : "",
    lastSeparator: [softline, bracketOut],
    grouped: true
  });

let groupIndex = 0;
const CallExpression = {
  print: ({ node, path, print }: any) => {
    let bracketOut = ')';
    let bracketIn = '(';
    switch (node.argumentsType) {
      case 0:
        bracketOut = ')';
        bracketIn = '(';
        break;
      case 1:
        bracketOut = '})';
        bracketIn = '({';
        break;
      case 2:
        bracketOut = '}';
        bracketIn = '{';
        break;
    }
    let expressionDoc = path.call(print, 'callee');
    let argumentsDoc: any = [bracketOut];

    if (node.arguments && node.arguments.length > 0) {
        argumentsDoc = printArguments(path, print, bracketOut, bracketIn);
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
      if (node.optional) {
        return label('MemberAccessChain', [expressionDoc, bracketIn, argumentsDoc, '!!']);
      } else {
        return label('MemberAccessChain', [expressionDoc, bracketIn, argumentsDoc]);
      }
    }

    if (node.optional) {
      return [expressionDoc, bracketIn, argumentsDoc, '!!'];
    } else {
      return [expressionDoc, bracketIn, argumentsDoc];
    }
  }
};

export default CallExpression;
