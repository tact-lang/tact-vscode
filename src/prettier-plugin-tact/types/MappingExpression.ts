const MappingExpression = {
  print: ({ node, path, print }: any) => //JSON.stringify(path)
  {
    return [
      'map<',
      path.call(print, 'from') + (node.fromPrimitive != "" ? " as " + path.call(print, 'fromPrimitive'):""),
      ', ',
      path.call(print, 'to') + (node.toPrimitive != "" ? " as " + path.call(print, 'toPrimitive'):""),
      '>'
    ];
  }
};

export default MappingExpression;
