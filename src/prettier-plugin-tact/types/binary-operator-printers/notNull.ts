export default {
  match: (op: any) => ['!!'].includes(op),
  print: (node: any, path: any, print: any) => {
    return [path.call(print, 'argument'), node.operator];
  }
};
