import {
  handleOwnLineComment,
  handleEndOfLineComment,
  handleRemainingComment
} from '../prettier-comments/language-js/comments';

import handlers from './handlers';

function TactHandleOwnLineComment(
  comment: any,
  text: any,
  options: any,
  ast: any,
  isLastComment: any
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = {
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  };

  if (
    handlers.some((handler: any) => handler(handlerArguments)) ||
    handleOwnLineComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

function TactHandleEndOfLineComment(
  comment: any,
  text: any,
  options: any,
  ast: any,
  isLastComment: any
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = {
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  };

  if (
    handlers.some((handler: any) => handler(handlerArguments)) ||
    handleEndOfLineComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

function TactHandleRemainingComment(
  comment: any,
  text: any,
  options: any,
  ast: any,
  isLastComment: any
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = {
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  };

  if (
    handlers.some((handler: any) => handler(handlerArguments)) ||
    handleRemainingComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

function isBlockComment(comment: any) {
  return comment.type === 'BlockComment';
}

export {
  TactHandleOwnLineComment as handleOwnLineComment,
  TactHandleEndOfLineComment as handleEndOfLineComment,
  TactHandleRemainingComment as handleRemainingComment,
  isBlockComment
};
