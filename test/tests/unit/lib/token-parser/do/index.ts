import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {DoTokenParser} from "../../../../../../src/lib/token-parser/do";
import {getParser} from "../../../../../mock-builder/parser";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('DoTokenParser', ({test}) => {
    test('parse', ({same, end}) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.EOF, null, 1, 1)
        ]);

        let tokenParser = new DoTokenParser();
        let parser = getParser(stream);

        sinon.stub(parser, 'parseExpression').returns(new Token(TokenType.NAME, 'foo', 1, 1));

        tokenParser.setParser(parser);

        same(tokenParser.parse(new Token(TokenType.TAG_START, null, 1, 1)).type, 'do');

        end();
    });
});
