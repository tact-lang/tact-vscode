const Type = {
  print: ({ node, path, print }: any) => typeof node.literal == "object" ? path.call(print, "literal") : node.literal
};

export default Type;
