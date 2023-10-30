import {TwingParser} from "../../src/lib/parser";
import {FilesystemEnvironment} from "../../src/lib/environment/filesystem-environment";
import {TwingLoaderNull} from "../../src/lib/loader/null";
import {TwingTokenStream} from "../../src/lib/token-stream";
import {Node} from "../../src/lib/node";
import {ExpressionNode} from "../../src/lib/node/expression";

const sinon = require('sinon');

class Parser extends TwingParser {
    constructor() {
        super(new FilesystemEnvironment(new TwingLoaderNull()));
    }

    parseExpression(): ExpressionNode {
        return null;
    }

    parseAssignmentExpression(): ExpressionNode | null {
        return null;
    }

    parseMultitargetExpression(): Node | null {
        return null;
    }
}

export function getParser(stream: TwingTokenStream): Parser {
    let parser = new Parser();

    Reflect.set(parser, 'stream', stream);
    Reflect.set(parser, 'handlers', new Map());

    sinon.stub(parser, 'hasBlock').returns(false);
    sinon.stub(parser, 'setBlock').returns(false);
    sinon.stub(parser, 'pushLocalScope').returns(false);
    sinon.stub(parser, 'pushBlockStack').returns(false);

    return parser;
}
