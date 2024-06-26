import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

import comparison from './comparison';

const internalPosition = (path: any): boolean => {
  const parentNode = path.getParentNode();
  return parentNode.type === 'BinaryExpression' || parentNode.type === 'UnaryExpression';
};

const groupIfNecessaryBuilder = (path: any) => (doc: any) => {
  const parentNode = path.getParentNode();
  if (
    parentNode.type === 'BinaryExpression' &&
    !comparison.match(parentNode.operator)
  ) {
    return doc;
  }
  return group(doc);
};

const indentIfNecessaryBuilder = (path: any) => (doc: any) => {
  let node = path.getNode();
  for (let i = 0; ; i += 1) {
    const parentNode = path.getParentNode(i);
    if (parentNode.type === 'ReturnStatement') return doc;
    if (
      parentNode.type !== 'BinaryExpression' ||
      comparison.match(parentNode.operator)
    ) {
      return indent(doc);
    }
    if (node === parentNode.right) return doc;
    node = parentNode;
  }
};

export default {
  match: (op: any) => ['+', '-', '*', '/', '%'].includes(op),
  print: (node: any, path: any, print: any) => {
    const groupIfNecessary = groupIfNecessaryBuilder(path);
    const indentIfNecessary = indentIfNecessaryBuilder(path);
    const ifInternalPosition: boolean = internalPosition(path);

    const right = [node.operator, line, path.call(print, 'right')];
    
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryExpression' &&
      path.getParentNode().type !== 'BinaryExpression';
    return groupIfNecessary([
      ifInternalPosition ? "(": "",
      path.call(print, 'left'),
      ' ',
      indentIfNecessary(shouldGroup ? group(right) : right),
      ifInternalPosition ? ")": "",
    ]);
  }
};
