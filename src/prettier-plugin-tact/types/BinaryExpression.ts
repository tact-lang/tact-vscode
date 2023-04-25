import printers from './binary-operator-printers';

const BinaryExpression = {
  print: ({ node, path, print, options }: any) => //JSON.stringify(node)
  {
    const binaryExpressionPrinter = Object.values(printers).find((printer) =>
      printer.match(node.operator)
    );
    if (binaryExpressionPrinter === undefined) {
      throw new Error(
        `Assertion error: no printer found for operator ${JSON.stringify(
          node.operator
        )}`
      );
    }
    return binaryExpressionPrinter.print(node, path, print);
  }
};

export default BinaryExpression;
