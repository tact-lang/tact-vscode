import { doc } from 'prettier';
import { printSeparatedList } from '../libs/printer-helpers';
const { hardlineWithoutBreakParent } = doc.builders;

const StructDefinition = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  {
    const parts = ['struct ', node.name, ' {'];

    if (node.body.length > 0) {
      parts.push(
        printSeparatedList(path.map(print, 'body'), {
          firstSeparator: hardlineWithoutBreakParent,
          separator: [hardlineWithoutBreakParent],
          lastSeparator: [],
          grouped: true
        })
      );
    }

    parts.push([hardlineWithoutBreakParent, '}']);

    return parts;
  }
};

export default StructDefinition;