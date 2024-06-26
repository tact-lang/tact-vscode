const DeclarativeExpression = {
  print: ({ node, path, print }: any) => {
    let out = [];
    out.push("let ");
    out.push(node.name);
    if (node.literal != "") {
      out.push(": ");
      out.push(path.call(print, 'literal'));
    }
    return out;
  }
};

export default DeclarativeExpression;
