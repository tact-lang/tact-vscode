const UnaryExpression = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
    node.prefix
      ? [
          node.operator,
          node.operator === 'delete' ? ' ' : '',
          path.call(print, 'argument'),
        ]
      : [path.call(print, 'argument'), node.operator]
      
};

export default UnaryExpression;
