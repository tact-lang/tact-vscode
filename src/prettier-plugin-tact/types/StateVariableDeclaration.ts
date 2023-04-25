import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const initialValue = (node: any, path: any, print: any) => {
  if (!node.value) {
    return '';
  }

  if (node.value.type === 'CallExpression') {
    return [' = ', path.call(print, 'value')];
  }

  return ' = ' + path.call(print, 'value');
};

const StateVariableDeclaration = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    node.is_const ? "const " : "",
    node.is_optional ? " optional " : "",
    node.name,
    ": ",
    path.call(print, "literal"),
    (node.typePrimitive != null ? " as " + path.call(print, "typePrimitive") : ""),
    initialValue(node, path, print),
    ';'
  ]
};

export default StateVariableDeclaration;
