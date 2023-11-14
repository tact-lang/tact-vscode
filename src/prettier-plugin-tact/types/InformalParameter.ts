const InformalParameter = {
  print: ({ node, path, print }: any) => 
  [node.id, ": ", path.call(print, "literal")]
};

export default InformalParameter;
