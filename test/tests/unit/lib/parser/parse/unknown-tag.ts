import * as tape from "tape";
import {TwingSource} from "../../../../../../src/lib/source";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {createParser} from "../../../../helpers/parser";

tape('TwingParser::parse', ({test}) => {
    test('throws an error when an unknown tag is encountered', ({fail, same, end}) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foobar', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new TwingSource('', 'foo'));

        let parser = createParser();

        try {
            parser.parse(createStackEntry(stream));

            fail();
        } catch (e: any) {
            same(e.message, 'Unknown "foobar" tag in "foo" at line 1.');
        }

        end();
    });

    test('throws an error with a suggestion when an unknown tag, close enough to a supported tag, is encountered', ({fail, same, end}) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foo', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new TwingSource('', 'foo'));

        let parser = createParser({
            tagHandlers: [{
                tag: 'for',
                initialize: () => {
                    return {} as any;
                }
            }]
        });

        try {
            parser.parse(createStackEntry(stream));

            fail();
        } catch (e: any) {
            same(e.message, 'Unknown "foo" tag. Did you mean "for" in "foo" at line 1?');
        }

        end();
    });
})
