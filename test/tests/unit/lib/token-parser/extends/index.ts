import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {ExtendsTokenParser} from "../../../../../../src/lib/tag-handler/extends";
import {getParser} from "../../../../../mock-builder/parser";
import {Token, TokenType} from "twig-lexer";
import {stub} from "sinon";

tape('ExtendsTokenParser', ({test}) => {
    test('parse', ({test}) => {
        test('with parent already set', ({same, end, fail}) => {
            let stream = new TwingTokenStream([]);

            let tokenParser = new ExtendsTokenParser();
            let parser = getParser(stream);

            tokenParser.initialize(parser);

            stub(parser, 'peekBlockStack').returns(false);
            stub(parser, 'isMainScope').returns(true);
            stub(parser, 'getParent').returns(true);

            try {
                tokenParser.parse(new Token(TokenType.NAME, 'foo', 1, 1));

                fail();
            } catch (e) {
                same(e.message, 'Multiple extends tags are forbidden in "" at line 1.');
            }

            end();
        });
    });
});
