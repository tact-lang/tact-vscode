import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const indentIfNecessaryBuilder = (path: any) => (doc: any) => {
  let node = path.getNode();
  for (let i = 0; ; i += 1) {
    const parentNode = path.getParentNode(i);
    if (parentNode.type === 'ReturnStatement') return doc;
    if (parentNode.type === 'IfStatement') return doc;
    if (parentNode.type === 'WhileStatement') return doc;
    if (parentNode.type !== 'BinaryExpression') return indent(doc);
    if (node === parentNode.right) return doc;
    node = parentNode;
  }
};

export default {
  match: (op: any) => ['<', '>', '<=', '>=', '==', '!='].includes(op),
  print: (node: any, path: any, print: any) => {
    const indentIfNecessary = indentIfNecessaryBuilder(path);
    const right = [node.operator, line, path.call(print, 'right')];
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryExpression' &&
      path.getParentNode().type !== 'BinaryExpression';
    return group([
      path.call(print, 'left'),
      ' ',
      indentIfNecessary(shouldGroup ? group(right) : right)
    ]);
  }
};
