import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {BlockTokenParser} from "../../../../../../src/lib/tag-handler/block";
import {getParser} from "../../../../../mock-builder/parser";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('BlockTokenParser', ({test}) => {
    test('parse', ({test}) => {
        test('when endblock name doesn\'t match', ({fail, same, end}) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.NAME, 'foo', 1, 1),
                new Token(TokenType.TAG_END, null, 1, 1),
                new Token(TokenType.TEXT, 'FOO', 1, 1),
                new Token(TokenType.TAG_START, null, 1, 1),
                new Token(TokenType.NAME, 'endblock', 1, 1),
                new Token(TokenType.NAME, 'bar', 1, 1),
                new Token(TokenType.TAG_END, null, 1, 1)
            ]);

            let tokenParser = new BlockTokenParser();
            let parser = getParser(stream);

            sinon.stub(parser, 'parseExpression').returns(new Token(TokenType.NAME, 'foo', 1, 1));

            tokenParser.initialize(parser);

            try {
                tokenParser.parse(new Token(TokenType.NAME, 'block', 1, 1));

                fail();
            } catch (e) {
                same(e.message, 'Expected endblock for block "foo" (but "bar" given) in "" at line 1.');
            }

            end();
        });
    });
});
