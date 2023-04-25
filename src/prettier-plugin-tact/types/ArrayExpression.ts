const ArrayExpression = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  [
    '[',
    node.elements ? path.call(print, 'elements') : '',
    ']'
  ]
};

export default ArrayExpression;
