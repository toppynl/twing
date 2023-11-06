import * as tape from "tape";
import {createParser} from "../../../../helpers/parser";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {TwingSource} from "../../../../../../src/lib/source";

tape('TwingParser::subparse', ({test}) => {
    test('supports TEXT tokens', ({same, assert, end}) => {
        const parser = createParser();
        
        const node = parser.subparse(createStackEntry(new TwingTokenStream([
            new Token(TokenType.TEXT, 'foo', 10, 11),
            new Token(TokenType.EOF, '', 1, 0)
        ], new TwingSource('', 'foo'))), null, null);

        same(node.line, 10);
        same(node.column, 11);
        assert(node.is("text") && node.attributes.data === 'foo');

        end();
    });
});
