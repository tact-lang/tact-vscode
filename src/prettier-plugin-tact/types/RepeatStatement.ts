const RevertStatement = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  ['repeat ', path.call(print, 'repeat'), ';']
};

export default RevertStatement;
