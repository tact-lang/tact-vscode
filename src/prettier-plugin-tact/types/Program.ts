import { printPreservingEmptyLines } from '../libs/printer-helpers';

const printBody = (node: any, path: any, options: any, print: any) =>
  node.body.length > 0
    ?  printPreservingEmptyLines(path, 'body', options, print)
    : '';

const Program = {
  print: ({ node, options, path, print }: any) => [
    printBody(node, path, options, print)
  ]
};

export default Program;
