import { doc } from 'prettier';
const { group } = doc.builders;

const ImportStatement = {
  print: ({ node, options }: any) => {
    return group(['import "', node.from, '";']);
  }
};

export default ImportStatement;
