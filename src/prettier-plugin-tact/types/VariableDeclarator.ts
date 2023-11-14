import { doc } from 'prettier';
const { group } = doc.builders;

const initialValue = (node: any, path: any, print: any) => {
  if (!node.init) {
    return '';
  }

  if (node.init.type === 'CallExpression') {
    return [' = ', path.call(print, 'init')];
  }

  return ' = ' + path.call(print, 'init');
};

const VariableDeclaration = {
  print: ({ node, path, print }: any) =>
    group([
      path.call(print, 'id'),
      ": ",
      path.call(print, 'typePrimitive'),
      initialValue(node, path, print),
      ';'
    ]) 
};

export default VariableDeclaration;