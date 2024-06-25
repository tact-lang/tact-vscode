import { doc } from 'prettier';
const { group } = doc.builders;

const Type = {
  print: ({ node, path, print }: any) => {
    let out = [];
    const literal = typeof node.literal == "object" ? path.call(print, "literal") : node.literal;
    out.push(literal);
    if (node.is_optional) {
      out.push('?');
    }
    if (node.members.length) {
      out.push('.' + node.members.join('.'));
    }
    if (node.array_parts.length) {
      out.push('[');
      out.push(path.map(print, "array_parts"));
      out.push(']');
    }
    if (node.array_subparts.length) {
      out.push('<');
      out.push(path.map(print, "array_subparts"));
      out.push('>');
    }
    return out;
  }
};

export default Type;
