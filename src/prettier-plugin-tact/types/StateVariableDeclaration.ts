import { doc } from 'prettier';
const { group, indent, line } = doc.builders;

const initialValue = (node: any, path: any, print: any) => {
  if (!node.value) {
    return '';
  }

  if (node.value.type === 'CallExpression') {
    return [' = ', path.call(print, 'value')];
  }

  return [' = ', path.call(print, 'value')];
};

const StateVariableDeclaration = {
  print: ({ node, path, print }: any) => //JSON.stringify(node)
  {
    let out = [];
    if (node.modifier && node.modifier.length) {
      out.push(node.modifier.join(" ") + " ");
    }
    if (node.is_const) {
      out.push("const ");
    }
    out.push(node.name);
    out.push(": ");
    out.push(path.call(print, "literal"));
    if (node.is_optional) {
      out.push("?");
    }
    if (node.typePrimitive != null) {
      out.push(" as ");
      out.push(path.call(print, "typePrimitive"));
    }
    out.push(initialValue(node, path, print));
    out.push(";"); 
    return out;
  }
};

export default StateVariableDeclaration;
