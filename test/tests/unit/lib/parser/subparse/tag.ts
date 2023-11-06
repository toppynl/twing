import * as tape from "tape";
import {createParser} from "../../../../helpers/parser";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {TwingSource} from "../../../../../../src/lib/source";
import {createBaseNode} from "../../../../../../src/lib/node";

tape('TwingParser::subparse', ({test}) => {
    test('supports TAG_START/TAG_END tokens', ({assert, end}) => {
        const parser = createParser({
            tagHandlers: [{
                tag: 'foo',
                initialize: () => {
                    return (token, {stream}) => {
                        const {line, column, value} = token;
                        
                        stream.expect(TokenType.TAG_END);
                        
                        return createBaseNode('tag', {value}, {}, line, column);
                    }
                }
            }]
        });
        
        const node = parser.subparse(createStackEntry(new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 10, 11),
            new Token(TokenType.NAME, 'foo', 10, 12),
            new Token(TokenType.TAG_END, '', 10, 13),
            new Token(TokenType.EOF, '', 11, 0)
        ], new TwingSource('', 'foo.twig'))), null, null);
        
        assert(
            node.line === 10
            && node.column === 12
            && node.type === "tag"
            && (node.attributes as any).value === 'foo'
        );

        end();
    });

    test('supports TAG_START/TAG_END tokens handled by a parser that returns null', ({assert, end}) => {
        const parser = createParser({
            tagHandlers: [{
                tag: 'foo',
                initialize: () => {
                    return (_token, {stream}) => {
                        stream.expect(TokenType.TAG_END);
                        
                        return null;
                    }
                }
            }]
        });

        const node = parser.subparse(createStackEntry(new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 10, 11),
            new Token(TokenType.NAME, 'foo', 10, 12),
            new Token(TokenType.TAG_END, '', 10, 13),
            new Token(TokenType.EOF, '', 11, 0)
        ], new TwingSource('', 'foo.twig'))), null, null);
        
        assert(
            node.line === 10
            && node.column === 11
            && node.type === null
        );

        end();
    });

    test('throws if not followed by a NAME token', ({fail, same, end}) => {
        const parser = createParser();

        try {
            parser.subparse(createStackEntry(new TwingTokenStream([
                new Token(TokenType.TAG_START, '', 10, 11),
                new Token(TokenType.TAG_END, '', 11, 11),
                new Token(TokenType.EOF, '', 1, 0)
            ], new TwingSource('', 'foo.twig'))), null, null);
            
            fail();
        }
        catch (error: any) {
            same(error.message, 'A block must start with a tag name in "foo.twig" at line 11.');
        }
        
        end();
    });

    test('throws if the NAME value is an unsupported tag', ({fail, same, end}) => {
        const parser = createParser();

        try {
            parser.subparse(createStackEntry(new TwingTokenStream([
                new Token(TokenType.TAG_START, '', 10, 11),
                new Token(TokenType.NAME, 'foo', 10, 12),
                new Token(TokenType.TAG_END, '', 10, 13),
                new Token(TokenType.EOF, '', 1, 0)
            ], new TwingSource('', 'foo.twig'))), null, null);

            fail();
        }
        catch (error: any) {
            same(error.message, 'Unknown "foo" tag in "foo.twig" at line 10.');
        }

        end();
    });

    test('throws if the tag parser does not find the expected end tag', ({fail, same, end}) => {
        const parser = createParser();

        try {
            parser.subparse(createStackEntry(new TwingTokenStream([
                new Token(TokenType.TAG_START, '', 10, 11),
                new Token(TokenType.NAME, 'bar', 10, 12),
                new Token(TokenType.TAG_END, '', 10, 13),
                new Token(TokenType.EOF, '', 1, 0)
            ], new TwingSource('', 'foo.twig'))), 'foo', () => false);

            fail();
        }
        catch (error: any) {
            same(error.message, 'Unexpected "bar" tag (expecting closing tag for the "foo" tag defined near line 10) in "foo.twig" at line 10.');
        }

        end();
    });
});
