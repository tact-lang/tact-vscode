const NameValueExpression = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  [
    path.call(print, 'value'),
  ]
};

export default NameValueExpression;