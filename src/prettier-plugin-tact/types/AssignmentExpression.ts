import printers from './binary-operator-printers';

const AssignmentExpression = {
  print: ({ node, path, print, options }: any) => //JSON.stringify(node)
  {
    const assignmentExpressionPrinter = Object.values(printers).find((printer) =>
      printer.match(node.operator)
    );
    if (assignmentExpressionPrinter === undefined) {
      throw new Error(
        `Assertion error: no printer found for operator ${JSON.stringify(
          node.operator
        )}`
      );
    }
    return assignmentExpressionPrinter.print(node, path, print);
  }
};

export default AssignmentExpression;
