const ThrowStatement = {
  print: ({ node, options, path, print }: any) => {
    return 'throw(' + node.code.value + ');';
  }
};

export default ThrowStatement;
