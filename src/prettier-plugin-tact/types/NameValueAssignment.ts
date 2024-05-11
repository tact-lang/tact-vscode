const NameValueExpression = {
  print: ({ node, path, print }: any) => {
    if (node.value == null) {
      return [ path.call(print, 'name') ]
    } else {
      return [ path.call(print, 'name'), ": ", path.call(print, 'value') ]
    }
  }
};

export default NameValueExpression;