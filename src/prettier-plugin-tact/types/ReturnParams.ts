import { doc } from 'prettier';
const { line, group } = doc.builders;
import { printSeparatedList } from '../libs/printer-helpers';

const ReturnParams = {
  print: ({ node, path, print }: any) => {
    //JSON.stringify(node)
    return node.params ? 
    [": ", 
      group(printSeparatedList(path.call(print, 'params'), {
        firstSeparator: "",
        lastSeparator: "",
        separator: "",
        grouped: false
      })),
      (node.is_optional ? "?": "")
    ] : [" "]
  }
};

export default ReturnParams;
