import {  doc } from 'prettier';
const { group, indent, line } = doc.builders;
import { printSeparatedList } from '../libs/printer-helpers';

const returnTypes = (node: any, path: any, print: any) =>
  node.returnTypes.length > 0
    ? [
        line,
        'returns (',
        printSeparatedList(path.map(print, 'returnTypes')),
        ')'
      ]
    : '';

const visibility = (node: any) =>
  node.visibility && node.visibility !== 'default'
    ? [line, node.visibility]
    : '';

const stateMutability = (node: any) =>
  node.stateMutability && node.stateMutability !== 'default'
    ? [line, node.stateMutability]
    : '';

const FunctionTypeName = {
  print: ({ node, path, print }: any) => [
    'function(',
    printSeparatedList(path.map(print, 'parameterTypes')),
    ')',
    indent(
      group([
        visibility(node),
        stateMutability(node),
        returnTypes(node, path, print)
      ])
    )
  ]
};

export default FunctionTypeName;
