import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {AutoEscapeTokenParser} from "../../../../../../src/lib/token-parser/auto-escape";
import {TwingParser} from "../../../../../../src/lib/parser";
import {FilesystemEnvironment} from "../../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../../src/lib/loader/array";
import {createTextNode} from "../../../../../../src/lib/node/text";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('TwingTokenParserAutoEscape', ({test}) => {
    test('parse', ({test}) => {
        test('when escaping strategy is not a string of false', ({same, end, fail}) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.NAME, 'foo', 1, 1)
            ]);

            let tokenParser = new AutoEscapeTokenParser();
            let parser = new TwingParser(new FilesystemEnvironment(new TwingLoaderArray({})));

            sinon.stub(parser, 'parseExpression').returns(createTextNode('foo', 1, 1, null));

            Reflect.set(parser, 'stream', stream);

            tokenParser.setParser(parser);

            try {
                tokenParser.parse(new Token(TokenType.TAG_START, '', 1, 1));

                fail();
            }
            catch (e) {
                same(e.message, 'An escaping strategy must be a string or false in "" at line 1.');
            }

            end();
        });
    });
});
