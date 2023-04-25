import { util, version } from 'prettier';
import satisfies from 'semver/functions/satisfies';

const { getNextNonSpaceNonCommentCharacterIndex, makeString } = util;

const prettierVersionSatisfies = (range: string) => satisfies(version, range);

function getNextNonSpaceNonCommentCharacter(text: any, node: any, locEnd: any) {
  return text.charAt(
    getNextNonSpaceNonCommentCharacterIndex(text, node, locEnd)
  );
}

function printString(rawContent: any, options: any) {
  const double = { quote: '"', regex: /"/g };
  const single = { quote: "'", regex: /'/g };

  const preferred = options.singleQuote ? single : double;
  const alternate = preferred === single ? double : single;

  let shouldUseAlternateQuote = false;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  // Also check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  if (
    rawContent.includes(preferred.quote) ||
    rawContent.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    const numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  }

  const enclosingQuote = shouldUseAlternateQuote
    ? alternate.quote
    : preferred.quote;

  // It might sound unnecessary to use `makeString` even if the string already
  // is enclosed with `enclosingQuote`, but it isn't. The string could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
  return makeString(rawContent, enclosingQuote as util.Quote);
}

function hasNodeIgnoreComment(node: any) {
  return (
    node &&
    node.comments &&
    node.comments.length > 0 &&
    node.comments.some((comment: any) => comment.value.trim() === 'prettier-ignore')
  );
}

export {
  getNextNonSpaceNonCommentCharacter,
  printString,
  prettierVersionSatisfies,
  hasNodeIgnoreComment
};
