import { doc } from 'prettier';
const { group, indent, label, softline } = doc.builders;

const MemberExpression = {
  print: ({ node, path, print }: any) => {
    const doc = [
      path.call(print, 'object'),
      label('separator', ['.']),
      path.call(print, 'property')
    ].flat();

    return doc;
  }
};

export default MemberExpression;
