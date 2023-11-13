import { doc } from 'prettier';
import { printSeparatedList } from '../libs/printer-helpers';
const { group, indent, line } = doc.builders;

const indexed = (node: any) => (node.isIndexed ? ' indexed' : '');

const visibility = (node: any) =>
  node.visibility && node.visibility !== 'default'
    ? [line, node.visibility]
    : '';

const constantKeyword = (node: any) => (node.isDeclaredConst ? ' constant' : '');

const storageLocation = (node: any) =>
  node.storageLocation && node.visibility !== 'default'
    ? [line, node.storageLocation]
    : '';

const immutable = (node: any) => (node.isImmutable ? ' immutable' : '');

const override = (node: any, path: any, print: any) => {
  if (!node.override) return '';
  if (node.override.length === 0) return [line, 'override'];
  return [
    line,
    'override(',
    printSeparatedList(path.map(print, 'override')),
    ')'
  ];
};

const name = (node: any) => (node.name ? [' ', node.name] : '');

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