const MappingExpression = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  {
    return [
      'map<',
      path.call(print, 'from'),
      ', ',
      path.call(print, 'to'),
      '>'
    ];
  }
};

export default MappingExpression;
