"use strict";

import * as PEG from "pegjs";
import * as fs from "fs";
import * as path from "path";
import tact from "./build/parser";

export class Parser {
    public getParser (rebuild: boolean) {
        if (rebuild == true) {
            let parserfile = fs.readFileSync(path.resolve("./tact.pegjs"), {encoding: "utf8"});
            return PEG.generate(parserfile);
        } else {
            return tact;
        }
    }

    public parse (source:string,  contractPath:string, _rebuild?:boolean, options?:any) {
        const rebuild = _rebuild ? _rebuild: false;
        
        let parser = this.getParser(rebuild);
        let result;
        try {
            result = parser.parse(source);
        } catch (e: any) {
            if (e) {
                e.message += " Contract: " + contractPath + " at Line: " + e.location.start.line + ", Column: " + e.location.start.column;
            }
            throw e;
        }

        if (typeof options === "object" && options.comment === true) {
            result.comments = this.parseComments(source);
        }

        return result;
    }

    public parseFile(file: string, rebuild: boolean) {
        return this.parse(fs.readFileSync(path.resolve(file), {encoding: "utf8"}), path.resolve(file), rebuild);
    }

    public parseComments(sourceCode: string) {
        // for Line comment regexp, the "." doesn't cover line termination chars so we're good :)
        const comments = [], commentParser = /(\/\*(\*(?!\/)|[^*])*\*\/)|(\/\/.*)/g;
        let nextComment;

        // eslint-disable-next-line no-cond-assign
        while (nextComment = commentParser.exec(sourceCode)) {
            const text = nextComment[0], types: any = { "//": "Line", "/*": "Block" };

            comments.push({
                text,
                type: types[text.slice(0, 2)],
                start: nextComment.index,
                end: nextComment.index + text.length
            });
        }

        return comments;
    }
}
