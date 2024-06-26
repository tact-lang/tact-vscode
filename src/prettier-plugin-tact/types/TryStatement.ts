import { doc } from 'prettier';
import { printSeparatedList } from '../libs/printer-helpers';
const { join, line } = doc.builders;

const TryStatement = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  {
    let out = [
      'try',
      ' ',
      path.call(print, 'tryStatement'),
    ];

    if (node.catchStatements != null) {
      out.push(' ', join(' ', path.map(print, 'catchStatements')));
    }

    return out;
  }
};

export default TryStatement;
