import { doc, util } from 'prettier';
const { hardline, join } = doc.builders;
const { hasNewline } = util;

function isIndentableBlockComment(comment: any) {
  // If the comment has multiple lines and every line starts with a star
  // we can fix the indentation of each line. The stars in the `/*` and
  // `*/` delimiters are not included in the comment value, so add them
  // back first.
  const lines = `*${comment.value}*`.split('\n');
  return lines.length > 1 && lines.every((line) => line.trim()[0] === '*');
}

function printIndentableBlockComment(comment: any) {
  const lines = comment.value.split('\n');

  return [
    '/*',
    join(
      hardline,
      lines.map((line: any, index: any) =>
        index === 0
          ? line.trimEnd()
          : ` ${index < lines.length - 1 ? line.trim() : line.trimStart()}`
      )
    ),
    '*/'
  ];
}

function printComment(commentPath: any, options: any) {
  const comment = commentPath.getValue();

  switch (comment.type) {
    case 'CommentBlock': {
      if (isIndentableBlockComment(comment)) {
        const printed = printIndentableBlockComment(comment);
        // We need to prevent an edge case of a previous trailing comment
        // printed as a `lineSuffix` which causes the comments to be
        // interleaved. See https://github.com/prettier/prettier/issues/4412
        if (
          comment.trailing &&
          !hasNewline(options.originalText, options.locStart(comment), {
            backwards: true
          })
        ) {
          return [hardline, printed];
        }
        return printed;
      }

      return `/*${comment.value}*/`;
    }
    case 'CommentLine':
      return `//${comment.value.trimEnd()}`;
    default:
      throw new Error(`Not a comment: ${JSON.stringify(comment)}`);
  }
}

export default printComment;
