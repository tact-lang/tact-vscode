import { doc } from 'prettier';
const { line } = doc.builders;
import { printPreservingEmptyLines } from '../libs/printer-helpers';

const StateMutabilitySpecifier = {
  print: ({ options, path, print }: any) => //JSON.stringify(path)
  [
    printPreservingEmptyLines(path, 'children', options, print),
    options.parentParser ? '' : line
  ]
};

export default StateMutabilitySpecifier;
