import { doc, util } from 'prettier';
import { prettierVersionSatisfies } from './util';

const { group, indent, join, line, softline, hardline } = doc.builders;
const { isNextLineEmptyAfterIndex } = util;

const printComments = (node: any, path: any, options: any, filter: (comment: any) => boolean = () => true) => {
  if (!node.comments) return '';
  const doc = join(
    line,
    path
      .map((commentPath: any) => {
        const comment = commentPath.getValue();
        if (comment.trailing || comment.leading || comment.printed) {
          return null;
        }
        if (!filter(comment)) {
          return null;
        }
        comment.printed = true;
        return options.printer.printComment(commentPath);
      }, 'comments')
      .filter(Boolean)
  );

  // The following if statement will never be 100% covered in a single run
  // since it depends on the version of Prettier being used.
  // Mocking the behaviour will introduce a lot of maintenance in the tests.
  /* c8 ignore start */
  return prettierVersionSatisfies('^2.3.0')
    ? doc.parts // Prettier V2
    : doc; // Prettier V3
  /* c8 ignore stop */
};

function printPreservingEmptyLines(path: any, key: any, options: any, print: any) {
  const parts: any = [];
  path.each((childPath: any, index: any) => {
    const node = childPath.getValue();
    const nodeType = node.type;

    if (
      // Avoid adding a hardline at the beginning of the document.
      parts.length !== 0
    ) {
      parts.push(hardline);
    }

    if (index > 0) {
      if (
        ['ContractStatement', 'FunctionDeclaration', 'ReceiveDeclaration', 'OnBounceDeclaration'].includes(nodeType) &&
        parts[parts.length - 2] !== hardline
      ) {
        parts.push(hardline);
      }
    }

    parts.push(print(childPath));

    if (
      isNextLineEmptyAfterIndex(
        options.originalText,
        options.locEnd(node) + 1
      ) ||
      (nodeType === 'FunctionDeclaration' || nodeType === 'ReceiveDeclaration' || nodeType === 'OnBounceDeclaration')
    ) {
      parts.push(hardline);
    }
  }, key);

  if (parts.length > 1 && parts[parts.length - 1] === hardline) {
    parts.pop();
  }

  return parts;
}

// This function will add an indentation to the `item` and separate it from the
// rest of the `doc` in most cases by a `softline`.
const printSeparatedItem = (
  item: any,
  {
    firstSeparator = softline,
    lastSeparator = firstSeparator,
    grouped = true
  }: any = {}
) => {
  const doc = [indent([firstSeparator, item]), lastSeparator];
  return grouped ? group(doc) : doc;
};

// This function will add an indentation to the `list` and separate it from the
// rest of the `doc` in most cases by a `softline`.
// the list itself will be printed with a separator that in most cases is a
// comma (,) and a `line`
const printSeparatedList = (
  list: any,
  { firstSeparator, separator = [',', line], lastSeparator, grouped }: any = {}
) =>
  printSeparatedItem(join(separator, list), {
    firstSeparator,
    lastSeparator,
    grouped
  });

export { printComments, printPreservingEmptyLines, printSeparatedList, printSeparatedItem };