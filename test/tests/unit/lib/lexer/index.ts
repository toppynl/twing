import * as tape from 'tape';
import {TwingLexer, typeToEnglish} from "../../../../../src/lib/lexer";
import {TokenType} from "twig-lexer";
import {createOperator} from "../../../../../src/lib/operator";

tape('lexer', (test) => {
    test.test('constructor', (test) => {
        test.test('support custom operators', (test) => {
            let lexer = new TwingLexer(new Map([
                ['foo', createOperator('foo', "BINARY", 0, () => {
                    return null as any;
                }, "LEFT")]
            ]), new Map([
                ['bar', createOperator('bar', "UNARY", 0, () => {
                    return null as any;
                }, "LEFT")]
            ]));

            let tokens = lexer.tokenize(`{{a foo b}}{{bar a}}`);

            test.true(tokens[3].test(TokenType.OPERATOR, 'foo'));
            test.true(tokens[8].test(TokenType.OPERATOR, 'bar'));

            test.end();
        });

        test.end();
    });

    test.test('should support type to english representation', (test) => {
        test.same(typeToEnglish(TokenType.TAG_END), 'end of statement block');
        test.same(typeToEnglish(TokenType.TAG_START), 'begin of statement block');
        test.same(typeToEnglish(TokenType.EOF), 'end of template');
        test.same(typeToEnglish(TokenType.INTERPOLATION_END), 'end of string interpolation');
        test.same(typeToEnglish(TokenType.INTERPOLATION_START), 'begin of string interpolation');
        test.same(typeToEnglish(TokenType.NAME), 'name');
        test.same(typeToEnglish(TokenType.NUMBER), 'number');
        test.same(typeToEnglish(TokenType.OPERATOR), 'operator');
        test.same(typeToEnglish(TokenType.PUNCTUATION), 'punctuation');
        test.same(typeToEnglish(TokenType.STRING), 'string');
        test.same(typeToEnglish(TokenType.TEXT), 'text');
        test.same(typeToEnglish(TokenType.VARIABLE_END), 'end of print statement');
        test.same(typeToEnglish(TokenType.VARIABLE_START), 'begin of print statement');
        test.same(typeToEnglish(TokenType.COMMENT_START), 'begin of comment statement');
        test.same(typeToEnglish(TokenType.COMMENT_END), 'end of comment statement');
        test.same(typeToEnglish(TokenType.ARROW), 'arrow function');

        try {
            typeToEnglish(-999 as any);
        } catch (error: any) {
            test.same((error as Error).message, 'Token of type "-999" does not exist.');
        }

        test.end();
    });

    test.end();
});
