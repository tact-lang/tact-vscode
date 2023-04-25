const NameValueExpression = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  [ path.call(print, 'name'),
    ": ",
    path.call(print, 'value'),
  ]
};

export default NameValueExpression;