import { doc } from 'prettier';
const { group } = doc.builders;
import { printSeparatedItem } from '../libs/printer-helpers';

const VariableDeclaration = {
  print: ({ node, path, print }: any) => group([node.var_type, " ", printSeparatedItem(path.map(print, 'declarations'))])
};

export default VariableDeclaration;
