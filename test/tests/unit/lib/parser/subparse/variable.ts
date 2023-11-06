import * as tape from "tape";
import {createParser} from "../../../../helpers/parser";
import {createStackEntry} from "../../../../../../src/lib/parser";
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {Token, TokenType} from "twig-lexer";
import {TwingSource} from "../../../../../../src/lib/source";

tape('TwingParser::subparse', ({test}) => {
    test('supports VARIABLE_START tokens', ({assert, end}) => {
        const parser = createParser();
        
        const node = parser.subparse(createStackEntry(new TwingTokenStream([
            new Token(TokenType.VARIABLE_START, 'foo', 10, 11),
            new Token(TokenType.NAME, 'bar', 10, 12),
            new Token(TokenType.VARIABLE_END, '', 11, 11),
            new Token(TokenType.EOF, '', 1, 0)
        ], new TwingSource('', 'foo'))), null, null);
        
        assert(
            node.line === 10
            && node.column === 11
            && node.is("print") 
            && node.children.expr.is("name") 
            && node.children.expr.line === 10 
            && node.children.expr.column === 12 
            && node.children.expr.attributes.name === 'bar'
        );

        end();
    });
});
