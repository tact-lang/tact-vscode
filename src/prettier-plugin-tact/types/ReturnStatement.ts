import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const expression = (node: any, path: any, print: any) => {
  if (node.argument == null && node.agrModificator != null) {
    return group(indent([line, path.map(print, 'agrModificator')]));
  }
  if (node.argument != null) {
    return group(indent([line, path.call(print, 'argument'), ';']));
  }
  return [';'];
};

const ReturnStatement = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    'return',
    expression(node, path, print)
  ]
};

export default ReturnStatement;
