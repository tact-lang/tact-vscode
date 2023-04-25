const DeclarativeExpression = {
  print: ({ node, path, print }: any) => ["let ", node.name, ": ", path.call(print, 'literal')] 
};

export default DeclarativeExpression;
