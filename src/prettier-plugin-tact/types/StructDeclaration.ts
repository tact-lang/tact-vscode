import { doc } from 'prettier';
import { printSeparatedList } from '../libs/printer-helpers';
const { hardlineWithoutBreakParent } = doc.builders;

const StructDefinition = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  {
    const parts = ['struct ', node.name, ' {'];

    if (node.members.length > 0) {
      parts.push(
        printSeparatedList(path.map(print, 'members'), {
          firstSeparator: hardlineWithoutBreakParent,
          separator: [';'],
          lastSeparator: [';', hardlineWithoutBreakParent],
          grouped: true
        })
      );
    }

    parts.push('}');

    return parts;
  }
};

export default StructDefinition;