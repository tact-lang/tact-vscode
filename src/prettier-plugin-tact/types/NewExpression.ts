const NewExpression = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  ['new ', path.call(print, 'typeName')]
};

export default NewExpression;
