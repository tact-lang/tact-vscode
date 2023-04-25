import { doc } from 'prettier';
const { softline } = doc.builders;
import { printSeparatedList } from '../libs/printer-helpers';

const printArguments = (path: any, print: any) =>
  printSeparatedList(path.map(print, 'arguments'), {
    firstSeparator: "",
    lastSeparator: [softline, ')'],
    grouped: true
  });


const InitOfExpression = {
  print: ({ node, path, print }: any) => //JSON.stringify(node) 
    ['initOf ', path.call(print, 'callee'), "(", printArguments(path, print)]
};

export default InitOfExpression;
