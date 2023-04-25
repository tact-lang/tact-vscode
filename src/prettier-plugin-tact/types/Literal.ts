const LiteralValue = {
  print: ({ node, path, print }: any) => typeof node.value == "string" ? `"${node.value}"` : node.value.toString()
};

export default LiteralValue;
