"use strict";

import * as PEG from "pegjs";
import * as fs from "fs";
import * as path from "path";
import tact from "./build/parser";

export class Parser {
    private prevResult: any;
    public getParser (rebuild: boolean) {
        if (rebuild == true) {
            let parserfile = fs.readFileSync(path.resolve("./tact.pegjs"), {encoding: "utf8"});
            return PEG.generate(parserfile);
        } else {
            return tact;
        }
    }

    public parseFormatter(input:string, opt: any) {
        let out = this.parse(input, "", false, {comment: true});
        return out;
    }

    public parse (source:string,  contractPath:string, _rebuild?:boolean, options?:any) {
        const rebuild = _rebuild ? _rebuild: false;
        
        let parser = this.getParser(rebuild);
        let result;
        try {
            result = parser.parse(source);
            this.prevResult = result;
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

    public getPrevResult () {
        return this.prevResult;
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
            const raw = nextComment[0], types: any = { "//": "CommentLine", "/*": "CommentBlock" };

            comments.push({
                value: (raw.slice(0, 2) == "//" ? raw.substring(2) : raw.substring(2, raw.length-2)),
                type: types[raw.slice(0, 2)],
                start: nextComment.index,
                end: nextComment.index + raw.length
            });
        }

        return comments;
    }
}
