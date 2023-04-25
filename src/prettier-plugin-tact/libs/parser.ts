// @ts-nocheck
import * as _TactParser from "../../parser/build/parser";

type TactParser = {
    parse: (input: string) => {};
    SyntaxError: (
        message: string,
        expected: string,
        found: unknown,
        location: unknown
    ) => unknown;
};

const TactParser = _TactParser as TactParser;
const parse = TactParser.parse;

export { TactParser, parse };
