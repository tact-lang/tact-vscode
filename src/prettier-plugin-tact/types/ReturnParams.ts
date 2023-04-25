const ReturnParams = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  node.params ? ": " + path.call(print, "params") : " "
};

export default ReturnParams;
