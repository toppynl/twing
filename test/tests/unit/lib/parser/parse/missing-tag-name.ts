import * as tape from "tape";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {TwingSource} from "../../../../../../src/lib/source";
import {createParser} from "../../../../helpers/parser";

tape('TwingParser::parse', ({test}) => {
    test('throws an error when a tag is missing a name', ({same, fail, end}) => {
        const parser = createParser();

        try {
            parser.parse(createStackEntry(new TwingTokenStream([
                new Token(TokenType.TAG_START, '', 1, 0),
                new Token(TokenType.VARIABLE_START, '', 1, 0),
                new Token(TokenType.TAG_END, '', 1, 0)
            ], new TwingSource('', 'foo'))));

            fail();
        } catch (e: any) {
            same(e.message, 'A block must start with a tag name in "foo" at line 1.');
        }

        end();
    });
});
