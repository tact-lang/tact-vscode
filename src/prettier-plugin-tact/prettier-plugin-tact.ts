import { util } from "prettier";
import { parse } from "./libs/parser";
import genericPrint from "./libs/printer";
import { printComment } from "./types/comments";
import type { Printer } from "prettier";

type PrinterComments = NonNullable<Printer["handleComments"]>;
type PrinterOwnLine = NonNullable<PrinterComments["ownLine"]>;
type PrinterEndOfLine = NonNullable<PrinterComments["endOfLine"]>;
type PrinterRemaining = NonNullable<PrinterComments["remaining"]>;

/**
 * This is called by prettier whenever it detects a comment on its own
 * line (i.e., only whitespace before/after). We have a chance to change what
 * node the comment is assigned to.
 *
 * @returns {boolean} `true` if the comment was handled, `false` to pass through to Prettier's default handler
 */
const handleOwnLineComment: PrinterOwnLine = (
    comment,
    text,
    options,
    ast,
    isLastComment
): boolean => {
    if ((options as any).debugComments && comment.value.includes("debug")) {
        console.log("handleOwnLineComment", comment);
    }

    const { enclosingNode, precedingNode, followingNode } = comment;

    if (enclosingNode && enclosingNode.type === "choice") {
        // If the comment is on its own line in a `choice` block,
        // It is probably meant to describe one of the choices. In this case,
        // it should be rendered *before* the node it is currently attached to.
        // I.e., at the end of the previous node.
        if (precedingNode) {
            util.addTrailingComment(precedingNode, comment);
            return true;
        }
    }
    if (enclosingNode && enclosingNode.type === "rule") {
        if (followingNode && followingNode.type === "delimiter") {
            // We have a comment before the `=`. For example,
            // abc
            //   // my comment
            //   = some rule
            util.addLeadingComment(followingNode, comment);
            return true;
        }
    }
    return false;
};

/**
 * This is called by prettier whenever it detects a comment at the end of a line
 * (i.e., there is some non-whitespace on the same line as the comment, but nothing
 * after the comment). We have a chance to change what
 * node the comment is assigned to.
 *
 * @returns {boolean} `true` if the comment was handled, `false` to pass through to Prettier's default handler
 */
const handleEndOfLineComment: PrinterEndOfLine = (
    comment,
    text,
    options,
    ast,
    isLastComment
): boolean => {
    if ((options as any).debugComments && comment.value.includes("debug")) {
        console.log("handleEndOfLineComment", comment);
    }

    const { enclosingNode, precedingNode, followingNode } = comment;

    if (
        enclosingNode &&
        (enclosingNode.type === "choice" || enclosingNode.type === "rule")
    ) {
        if (
            !comment.multiline &&
            precedingNode &&
            precedingNode.type === "delimiter"
        ) {
            // Single-line comments that come directly after a delimiter should really
            // be printed *before* that delimiter.
            util.addLeadingComment(precedingNode, comment);
            return true;
        }

        if (
            !comment.multiline &&
            followingNode &&
            followingNode.type === "stringliteral"
        ) {
            // Reformat rules like
            //   a //some comment
            //     "label" = y
            // to
            //   a "label" // some comment
            //     = y
            util.addTrailingComment(followingNode, comment);
            return true;
        }
    }
    return false;
};

/**
 * This is called by prettier whenever it finds a comment that it cannot classify
 * as `ownLine` or `endOfLine`. We have a chance to change what
 * node the comment is assigned to.
 * @returns {boolean} `true` if the comment was handled, `false` to pass through to Prettier's default handler
 */
const handleRemainingComment: PrinterRemaining = (
    comment,
    text,
    options,
    ast,
    isLastComment
): boolean => {
    if ((options as any).debugComments && comment.value.includes("debug")) {
        console.log("handleRemainingComment", comment);
    }
    return false;
};

export const languages = [
    {
        name: "tact",
        extensions: [".tact"],
        parsers: ["tact-parser"],
    },
];

export const parsers = {
    "tact-parser": {
        parse,
        astFormat: "tact-ast",
        locStart: (node: any) => node.start,
        locEnd: (node: any) => node.end,
    },
};

export const printers = {
    "tact-ast": {
        print: genericPrint,
        canAttachComment: (node: any) =>
            node && node.type && node.type !== "CommentLine" && node.type !== "CommentBlock",
        isBlockComment: (node: any) =>
            node && node.type === "CommentBlock",
        printComment: printComment,
        handleComments: {
            ownLine: handleOwnLineComment,
            endOfLine: handleEndOfLineComment,
            remaining: handleRemainingComment,
        },
    },
};

export const options = {
    actionParser: {
        type: "string",
        category: "Global",
        default: "babel-ts",
        description: "The parser to use for the content of Tact actions",
    },
};

export default { languages, parsers, printers, options };