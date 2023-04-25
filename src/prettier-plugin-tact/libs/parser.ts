// @ts-nocheck
import {Parser} from "../../parser/tact";

const _TactParser = new Parser();

const TactParser = {
    parse: (input: string, options: any) => {
        return _TactParser.parseFormatter(input, options);
    },
    SyntaxError: (
        message: string,
        expected: string,
        found: unknown,
        location: unknown
    ) => {}
};

const parse = TactParser.parse;

export { TactParser, parse };
