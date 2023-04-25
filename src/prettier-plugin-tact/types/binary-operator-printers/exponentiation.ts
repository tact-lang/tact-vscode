import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

export default {
  match: (op: any) => op === '**',
  print: (node: any, path: any, print: any) => {
    const right = [' ', node.operator, line, path.call(print, 'right')];
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryExpression' &&
      path.getParentNode().type !== 'BinaryExpression';
    return group([
      path.call(print, 'left'),
      indent(shouldGroup ? group(right) : right)
    ]);
  }
};
