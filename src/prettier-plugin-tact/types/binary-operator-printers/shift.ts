import arithmetic from './arithmetic';

export default {
  match: (op: any) => ['<<', '>>'].includes(op),
  print: arithmetic.print
};
