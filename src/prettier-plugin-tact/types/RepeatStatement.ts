const RevertStatement = {
  print: ({ path, print }: any) => //JSON.stringify(path)
  ['revert ', path.call(print, 'revertCall'), ';']
};

export default RevertStatement;
