import * as tape from "tape";
import {createParser} from "../../../../helpers/parser";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {TwingSource} from "../../../../../../src/lib/source";

tape('TwingParser::subparse', ({test}) => {
    test('supports COMMENT tokens', ({same, assert, end}) => {
        const parser = createParser();
        
        const node = parser.subparse(createStackEntry(new TwingTokenStream([
            new Token(TokenType.COMMENT_START, '', 10, 11),
            new Token(TokenType.TEXT, 'foo', 10, 12),
            new Token(TokenType.COMMENT_END, '', 10, 13),
            new Token(TokenType.EOF, '', 1, 0)
        ], new TwingSource('', 'foo'))), null, null);

        console.log(node.toString());
        
        same(node.line, 10);
        same(node.column, 12);
        assert(node.is("comment") && node.attributes.data === 'foo');

        end();
    });
});
