import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {VerbatimTokenParser} from "../../../../../../src/lib/token-parser/verbatim";
import {getParser} from "../../../../../mock-builder/parser";
import {Token, TokenType} from "twig-lexer";

tape('VerbatimTokenParser', ({test}) => {
    test('parse', ({same, end}) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.TEXT, 'foo', 1, 1),
            new Token(TokenType.TAG_START, null, 1, 1),
            new Token(TokenType.NAME, 'endverbatim', 1, 1),
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.EOF, null, 1, 1)
        ]);

        let tokenParser = new VerbatimTokenParser();
        let parser = getParser(stream);

        tokenParser.setParser(parser);

        let node = tokenParser.parse(new Token(TokenType.TAG_START, null, 1, 1));

        same(node.type, 'verbatim');
        same(node.attributes.data, 'foo');

        end();
    });
});
