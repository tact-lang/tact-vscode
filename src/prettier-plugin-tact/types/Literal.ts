const LiteralValue = {
  print: ({ node, path, print }: any) => {
    return typeof node.value == "string" ? (node.value.substring(0, 2) == "0x" ? node.value: `"${node.value}"`) : node.value.toString();
  }
};

export default LiteralValue;
