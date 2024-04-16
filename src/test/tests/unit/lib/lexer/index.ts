import * as tape from 'tape';
import {TwingLexer, typeToEnglish} from "../../../../../main/lib/lexer";
import {createOperator} from "../../../../../main/lib/operator";

tape('lexer', (test) => {
    test.test('constructor', (test) => {
        test.test('support custom operators', (test) => {
            let lexer = new TwingLexer(
                2,
                [
                    createOperator('foo', "BINARY", 0, () => {
                        return null as any;
                    }, "LEFT")
                ],
                [
                    createOperator('bar', "UNARY", 0, () => {
                        return null as any;
                    }, "LEFT")
                ]
            );

            let tokens = lexer.tokenize(`{{a foo b}}{{bar a}}`);

            test.true(tokens[3].test("OPERATOR", 'foo'));
            test.true(tokens[8].test("OPERATOR", 'bar'));

            test.end();
        });

        test.end();
    });

    test.test('should support type to english representation', (test) => {
        test.same(typeToEnglish("TAG_END"), 'end of statement block');
        test.same(typeToEnglish("TAG_START"), 'begin of statement block');
        test.same(typeToEnglish("EOF"), 'end of template');
        test.same(typeToEnglish("INTERPOLATION_END"), 'end of string interpolation');
        test.same(typeToEnglish("INTERPOLATION_START"), 'begin of string interpolation');
        test.same(typeToEnglish("NAME"), 'name');
        test.same(typeToEnglish("NUMBER"), 'number');
        test.same(typeToEnglish("OPERATOR"), 'operator');
        test.same(typeToEnglish("PUNCTUATION"), 'punctuation');
        test.same(typeToEnglish("STRING"), 'string');
        test.same(typeToEnglish("TEXT"), 'text');
        test.same(typeToEnglish("VARIABLE_END"), 'end of print statement');
        test.same(typeToEnglish("VARIABLE_START"), 'begin of print statement');
        test.same(typeToEnglish("COMMENT_START"), 'begin of comment statement');
        test.same(typeToEnglish("COMMENT_END"), 'end of comment statement');
        test.same(typeToEnglish("ARROW"), 'arrow function');

        try {
            typeToEnglish(-999 as any);
        } catch (error: any) {
            test.same((error as Error).message, 'Token of type "-999" does not exist.');
        }

        test.end();
    });

    test.end();
});
