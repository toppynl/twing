import * as tape from 'tape';
import * as sinon from 'sinon';
import {TwingParser, TwingParserOptions} from "../../../../../src/lib/parser";
import {createBaseNode, Node} from "../../../../../src/lib/node";
import {TwingTokenStream} from "../../../../../src/lib/token-stream";
import {TokenParser} from "../../../../../src/lib/token-parser";
import {Token, TokenType} from "twig-lexer";
import {createTextNode} from "../../../../../src/lib/node/text";
import {TwingLoaderArray} from "../../../../../src/lib/loader/array";
import {TwingSource} from "../../../../../src/lib/source";
import {TwingErrorSyntax} from "../../../../../src/lib/error/syntax";
import {TwingExtension} from "../../../../../src/lib/extension";
import {TwingOperator, TwingOperatorType} from "../../../../../src/lib/operator";
import {createConstantNode} from "../../../../../src/lib/node/expression/constant";
import {TwingFunction} from "../../../../../src/lib/function";
import {TwingTest} from "../../../../../src/lib/test";
import {TwingFilter} from "../../../../../src/lib/filter";
import {createArrayNode} from "../../../../../src/lib/node/expression/array";
import {createConcatNode} from "../../../../../src/lib/node/expression/binary/concat";
import {createNameNode} from "../../../../../src/lib/node/expression/name";
import {MockLoader} from "../../../../mock/loader";
import {createMockedEnvironment} from "../../../../mock/environment";
import {createHashNode} from "../../../../../src/lib/node/expression/hash";
import type {ExpressionNode,} from "../../../../../src/lib/node/expression";
import {createSetNode} from "../../../../../src/lib/node/set";
import {
    TwingExtensionCore,
    TwingExtensionSet
} from "../../../../../src";
import {createEnvironment, TwingEnvironment} from "../../../../../src/lib/environment";

class TestTokenParser extends TokenParser {
    parse(_token: Token) {
        // simulate the parsing of another template right in the middle of the parsing of the active template
        this.parser.parse(new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'extends', 1, 0),
            new Token(TokenType.STRING, 'base', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ]));

        this.parser.getStream().expect(TokenType.TAG_END);

        return createBaseNode(null);
    }

    getTag() {
        return 'test';
    }
}

class TwingTestExpressionParserExtension extends TwingExtension {
    getOperators() {
        return [
            new TwingOperator('with-callable', TwingOperatorType.BINARY, 1, () => {
                    return createConstantNode('3', 1, 1);
                }
            )
        ];
    }

    getFunctions() {
        return [
            new TwingFunction('deprecated', () => Promise.resolve(), [], {
                deprecated: true
            }),
            new TwingFunction('deprecated_with_version', () => Promise.resolve(), [], {
                deprecated: '1'
            }),
            new TwingFunction('deprecated_with_alternative', () => Promise.resolve(), [], {
                deprecated: '1',
                alternative: 'alternative'
            }),
        ];
    }

    getTests() {
        return [
            new TwingTest('foo bar', () => Promise.resolve(true), [])
        ]
    }

    getFilters() {
        return [
            new TwingFilter('deprecated', () => Promise.resolve(), [], {
                deprecated: true
            }),
            new TwingFilter('deprecated_with_version', () => Promise.resolve(), [], {
                deprecated: '1'
            }),
            new TwingFilter('deprecated_with_alternative', () => Promise.resolve(), [], {
                deprecated: '1',
                alternative: 'alternative'
            })
        ];
    }

    getTokenParsers() {
        return [
            new TestTokenParser()
        ];
    }
}

let testEnv = createMockedEnvironment();

const extensionSet = new TwingExtensionSet();

extensionSet.addExtension(new TwingExtensionCore(), 'core');
extensionSet.addExtension(new TwingTestExpressionParserExtension(), 'extension');

const getParser = (
    environment?: TwingEnvironment,
    options?: TwingParserOptions
) => {
    let parser = new TwingParser(
        environment || testEnv,
        extensionSet.getUnaryOperators(),
        extensionSet.getBinaryOperators(),
        extensionSet.getTokenParsers(),
        extensionSet.getNodeVisitors(),
        [...extensionSet.getFilters().keys()],
        [...extensionSet.getFunctions().keys()],
        [...extensionSet.getTests().keys()],
        options
    );

    return parser;
};
//
// class Parser extends TwingParser {
//     parseArrow() {
//         return super.parseArrow();
//     }
// }

const getFilterBodyNodesData = (): Array<{ input: Node, expected: Node }> => {
    let input;

    return [
        {
            input: createBaseNode(null, {}, {
                0: createTextNode('   ', 1, 0)
            }),
            expected: createBaseNode(null),
        },
        {
            input: input = createBaseNode(null, {}, {
                0: createSetNode(false, createBaseNode(null), createBaseNode(null), 1, 0)
            }),
            expected: input
        },
        {
            input: input = createBaseNode(null, {}, {
                0: createSetNode(
                    true,
                    createBaseNode(null),
                    createBaseNode(null, {}, {
                        0: createBaseNode(null, {}, {
                            0: createTextNode('foo', 1, 0)
                        })
                    }),
                    1, 0
                )
            }),
            expected: input
        },
    ];
};

const getFilterBodyNodesWithBOMData = () => {
    return [
        ' ',
        "\t",
        "\n",
        "\n\t\n   ",
    ];
};

tape('parser', (test) => {
    test.test('testUnknownTag', (test) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foo', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new TwingSource('', 'foo'));

        let parser = getParser();

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.message, 'Unknown "foo" tag. Did you mean "for" in "foo" at line 1?');
        }

        test.end();
    });

    test.test('testUnknownTagWithoutSuggestions', (test) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foobar', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new TwingSource('', 'foo'));

        let parser = getParser();

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.message, 'Unknown "foobar" tag in "foo" at line 1.');
        }

        test.end();
    });

    test.test('testFilterBodyNodes', ({same, end}) => {
        let parser = getParser();

        getFilterBodyNodesData().forEach((data) => {
            const filteredNode = parser.filterBodyNodes(data.input);

            same(filteredNode.type, data.expected.type);
            same(filteredNode.attributes, data.expected.attributes);
        });

        end();
    });

    test.test('testFilterBodyNodesThrowsException', (test) => {
        let parser = getParser();

        parser.setParent(createConstantNode('foo', 1, 1));
        parser['stream'] = new TwingTokenStream([], new TwingSource('', 'foo'));

        let fixtures = [
            createTextNode('foo', 1, 0),
            createBaseNode(null, {}, {
                0: createBaseNode(null, {}, {
                    0: createTextNode('foo', 1, 0)
                })
            })
        ];

        try {
            fixtures.forEach(function (fixture) {
                parser.filterBodyNodes(fixture);
            });

            test.fail();
        } catch (e: any) {
            test.same(e.message, 'A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "foo" at line 1?');
        }

        test.end();
    });

    test.test('testFilterBodyNodesWithBOM', (test) => {
        let parser = getParser();

        parser.setParent(createConstantNode('foo', 1, 1));
        parser['stream'] = new TwingTokenStream([], new TwingSource('', 'foo'));

        let bomData = String.fromCharCode(0xEF, 0xBB, 0xBF);

        try {
            parser.filterBodyNodes(createTextNode(bomData + 'not empty', 1, 0));

            test.fail();
        } catch (e: any) {
            test.same(e.message, 'A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "foo" at line 1?');
        }

        for (let emptyNode of getFilterBodyNodesWithBOMData()) {
            test.same(null, parser.filterBodyNodes(createTextNode(bomData + emptyNode, 1, 0)));
        }

        test.end();
    });

    test.test('testParseIsReentrant', (test) => {
        let twing = createMockedEnvironment(undefined, {
            escapingStrategy: false
        });

        let parser = getParser(twing);

        parser.parse(new TwingTokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'test', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.VARIABLE_START, '', 1, 0),
            new Token(TokenType.NAME, 'foo', 1, 0),
            new Token(TokenType.VARIABLE_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ]));

        test.isEqual(parser.getParent(), null);

        test.end();
    });

    test.test('testGetVarName', (test) => {
        let twing = createEnvironment(new TwingLoaderArray({}), {
            escapingStrategy: false
        });

        // The getVarName() must not depend on the template loaders,
        // If this test does not throw any exception, that's good.
        // see https://github.com/symfony/symfony/issues/4218
        try {
            let ast = twing.parse(twing.tokenize(new TwingSource('{% from _self import foo %}\n\n{% macro foo() %}\n{{ foo }}\n{% endmacro %}', 'index')));

            test.ok(ast);
        } catch (e: any) {
            test.fail(e);
        }

        test.end();
    });

    test.test('should throw an error on missing tag name', (test) => {
        let twing = createMockedEnvironment(undefined, {
            escapingStrategy: false
        });

        twing.addTokenParser(new TestTokenParser());

        let parser = getParser(twing);

        try {
            parser.parse(new TwingTokenStream([
                new Token(TokenType.TAG_START, '', 1, 0),
                new Token(TokenType.VARIABLE_START, '', 1, 0),
                new Token(TokenType.TAG_END, '', 1, 0)
            ], new TwingSource('', 'foo')));

            test.fail();
        } catch (e: any) {
            test.same(e.message, 'A block must start with a tag name in "foo" at line 1.');
        }

        test.end();
    });

    test.test('parse', (test) => {
        let twing = createMockedEnvironment(undefined, {
            escapingStrategy: false
        });

        let parser = getParser(twing);

        let stub = sinon.stub(parser, 'subparse');

        stub.throws(new Error('foo'));

        try {
            parser.parse(new TwingTokenStream([], new TwingSource('', 'foo')));

            test.fail()
        } catch (e: any) {
            test.same(e.name, 'Error');
            test.same(e.message, 'foo');
        }

        stub.throws(new TwingErrorSyntax('foo.'));

        try {
            parser.parse(new TwingTokenStream([], new TwingSource('', 'foo')));

            test.fail()
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'foo in "foo".');
        }

        test.end();
    });

    test.test('subparse', (test) => {
        let twing = createMockedEnvironment(undefined, {
            escapingStrategy: false
        });

        let parser = getParser(twing);

        try {
            parser.parse(new TwingTokenStream([
                new Token(TokenType.TAG_START, '{%', 1, 0),
                new Token(TokenType.NAME, 'foo', 1, 0),
                new Token(TokenType.TAG_END, '{', 1, 0)
            ], new TwingSource('', 'foo')), [false, () => {
                return false;
            }]);

            test.fail()
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unexpected "foo" tag in "foo" at line 1');
        }

        try {
            parser.parse(new TwingTokenStream([
                new Token(-999 as any, null, 1, 0)
            ], new TwingSource('', 'foo')), ['foo', () => {
                return false;
            }]);

            test.fail()
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Lexer or parser ended up in unsupported state in "foo" at line 1.');
        }

        test.end();
    });

    test.test('getImportedSymbol', (test) => {
        let twing = createMockedEnvironment();
        let parser = getParser(twing);

        Reflect.set(parser, 'importedSymbols', [new Map()]);
        parser.addImportedSymbol('foo', 'not bar');

        test.equals(parser.getImportedSymbol('foo', 'bar'), null);

        test.end();
    });

    test.test('hasMacro', (test) => {
        let twing = createMockedEnvironment();
        let parser = getParser(twing);

        Reflect.set(parser, 'macros', {foo: 'bar'});

        test.true(parser.hasMacro('foo'));

        test.end();
    });

    test.test('supports comment tokens', ({assert, end}) => {
        const environment = createMockedEnvironment(undefined, {
            escapingStrategy: false
        });

        const parser = getParser(environment);

        let node = parser.parse(new TwingTokenStream([
            new Token(TokenType.COMMENT_START, '', 1, 0),
            new Token(TokenType.TEXT, 'test', 1, 0),
            new Token(TokenType.COMMENT_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new TwingSource('', 'foo')));

        let body = node.children.body;

        assert(
            body.children.content.is('comment')
            && body.children.content.attributes.data === 'test'
        );

        end();
    });

    test.test('canOnlyAssignToNames', ({test}) => {
        let templatesAndMessages: Array<[string, string]> = [
            ['{% set false = "foo" %}', 'You cannot assign a value to "false" in "index" at line 1.'],
            ['{% set FALSE = "foo" %}', 'You cannot assign a value to "FALSE" in "index" at line 1.'],
            ['{% set true = "foo" %}', 'You cannot assign a value to "true" in "index" at line 1.'],
            ['{% set TRUE = "foo" %}', 'You cannot assign a value to "TRUE" in "index" at line 1.'],
            ['{% set none = "foo" %}', 'You cannot assign a value to "none" in "index" at line 1.'],
            ['{% set NONE = "foo" %}', 'You cannot assign a value to "NONE" in "index" at line 1.'],
            ['{% set null = "foo" %}', 'You cannot assign a value to "null" in "index" at line 1.'],
            ['{% set NULL = "foo" %}', 'You cannot assign a value to "NULL" in "index" at line 1.'],
            ['{% set 3 = "foo" %}', 'Only variables can be assigned to. Unexpected token "number" of value "3" ("name" expected) in "index" at line 1.'],
            ['{% set 1 + 2 = "foo" %}', 'Only variables can be assigned to. Unexpected token "number" of value "1" ("name" expected) in "index" at line 1.'],
            ['{% set "bar" = "foo" %}', 'Only variables can be assigned to. Unexpected token "string" of value "bar" ("name" expected) in "index" at line 1.'],
            ['{% set %}{% endset %})', 'Only variables can be assigned to. Unexpected token "end of statement block" of value "%}" ("name" expected) in "index" at line 1.']
        ];

        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let parser = getParser(env);

        for (const [templateSource, expectation] of templatesAndMessages) {
            test(expectation, ({same, fail, end}) => {
                const source = new TwingSource(templateSource, 'index');

                try {
                    parser.parse(env.tokenize(source));

                    fail();
                } catch (e: any) {
                    same(e.name, 'TwingErrorSyntax');
                    same(e.message, expectation);
                }

                end();
            });
        }
    });

    test.test('arrayExpression', ({test}) => {
        const templatesAndNodes: [string, ExpressionNode][] = [
            // simple array
            ['{{ [1, 2] }}', createArrayNode({
                0: createConstantNode(0, 1, 5),
                1: createConstantNode(1, 1, 5),

                2: createConstantNode(1, 1, 8),
                3: createConstantNode(2, 1, 8)
            }, 1, 5)],

            // array with trailing ,
            ['{{ [1, 2, ] }}', createArrayNode({
                0: createConstantNode(0, 1, 5),
                1: createConstantNode(1, 1, 5),

                2: createConstantNode(1, 1, 8),
                3: createConstantNode(2, 1, 8)
            }, 1, 5)],

            // simple hash
            ['{{ {"a": "b", "b": "c"} }}', createHashNode({
                0: createConstantNode('a', 1, 5),
                1: createConstantNode('b', 1, 10),

                2: createConstantNode('b', 1, 15),
                3: createConstantNode('c', 1, 20)
            }, 1, 5)],

            // hash with trailing ,
            ['{{ {"a": "b", "b": "c", } }}', createHashNode({
                0: createConstantNode('a', 1, 5),
                1: createConstantNode('b', 1, 10),

                2: createConstantNode('b', 1, 15),
                3: createConstantNode('c', 1, 20)
            }, 1, 5)],

            // hash in an array
            ['{{ [1, {"a": "b", "b": "c"}] }}', createArrayNode({
                0: createConstantNode(0, 1, 5),
                1: createConstantNode(1, 1, 5),

                2: createConstantNode(1, 1, 9),
                3: createHashNode({
                    0: createConstantNode('a', 1, 9),
                    1: createConstantNode('b', 1, 14),

                    2: createConstantNode('b', 1, 19),
                    3: createConstantNode('c', 1, 24)
                }, 1, 9)
            }, 1, 5)],

            // array in a hash
            ['{{ {"a": [1, 2], "b": "c"} }}', createHashNode({
                0: createConstantNode('a', 1, 5),
                1: createArrayNode({
                    0: createConstantNode(0, 1, 11),
                    1: createConstantNode(1, 1, 11),

                    2: createConstantNode(1, 1, 14),
                    3: createConstantNode(2, 1, 14)
                }, 1, 11),
                2: createConstantNode('b', 1, 18),
                3: createConstantNode('c', 1, 23)
            }, 1, 5)],
        ];

        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let parser = getParser(env);

        for (let [source, expectation] of templatesAndNodes) {
            test(source, ({end, assert}) => {
                let stream = env.tokenize(new TwingSource(source, ''));

                const moduleNode = parser.parse(stream);

                const {body} = moduleNode.children;

                assert(
                    body.children.content.type === "print"
                    && body.children.content.children.expr.toString() === expectation.toString()
                )

                end();
            });
        }
    })
    ;

    test.test('arraySyntaxError', (test) => {
        let templatesAndMessages = [
            ['{{ [1, "a": "b"] }}', 'An array element must be followed by a comma. Unexpected token "punctuation" of value ":" ("punctuation" expected with value ",") in "index" at line 1.'],
            ['{{ {"a": "b", 2} }}', 'A hash key must be followed by a colon (:). Unexpected token "punctuation" of value "}" ("punctuation" expected with value ":") in "index" at line 1.']
        ];

        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let parser = getParser(env);

        for (let templateAndMessage of templatesAndMessages) {
            let source = new TwingSource(templateAndMessage[0], 'index');

            try {
                parser.parse(env.tokenize(source));

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, templateAndMessage[1]);
            }
        }

        test.end();
    });

    test.test('stringExpressionDoesNotConcatenateTwoConsecutiveStrings', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{{ "a" "b" }}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unexpected token "string" of value "b" ("end of print statement" expected) in "index" at line 1.');
        }

        test.end();
    });

    test.test('stringExpression', (test) => {
        let templatesAndNodes: [string, ExpressionNode][] = [
            ['{{ "foo" }}', createConstantNode('foo', 1, 4)],
            ['{{ "foo #{bar}" }}', createConcatNode(
                [
                    createConstantNode('foo ', 1, 4),
                    createNameNode('bar', 1, 11)
                ], 1, 11)],
            ['{{ "foo #{bar} baz" }}', createConcatNode([
                    createConcatNode(
                        [
                            createConstantNode('foo ', 1, 4),
                            createNameNode('bar', 1, 11)
                        ], 1, 11
                    ),
                    createConstantNode(' baz', 1, 15)
                ], 1, 15
            )],
            ['{{ "foo #{"foo #{bar} baz"} baz" }}', createConcatNode(
                [
                    createConcatNode(
                        [
                            createConstantNode('foo ', 1, 4),
                            createConcatNode(
                                [
                                    createConcatNode([
                                        createConstantNode('foo ', 1, 11),
                                        createNameNode('bar', 1, 18)
                                    ], 1, 18),
                                    createConstantNode(' baz', 1, 22)
                                ], 1, 22)
                        ], 1, 22),
                    createConstantNode(' baz', 1, 28)
                ], 1, 28)
            ]
        ];

        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let parser = getParser(env);

        for (let templateAndNodes of templatesAndNodes) {
            let stream = env.tokenize(new TwingSource(templateAndNodes[0], ''));

            const moduleNode = parser.parse(stream);
            const expected = templateAndNodes[1];

            test.assert(
                moduleNode.children.body.children.content.type === "print"
                && moduleNode.children.body.children.content.children.expr.toString() === expected.toString()
            );
        }
        test.end();
    });

    test.test('attributeCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{{ foo.bar(name="Foo") }}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Arguments must be separated by a comma. Unexpected token "operator" of value "=" ("punctuation" expected with value ",") in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{% from _self import foo %}{% macro foo() %}{% endmacro %}{{ foo(name="Foo") }}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Arguments must be separated by a comma. Unexpected token "operator" of value "=" ("punctuation" expected with value ",") in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{% macro foo("a") %}{% endmacro %}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'An argument must be a name. Unexpected token "string" of value "a" ("name" expected) in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroDefinitionDoesNotSupportNonConstantDefaultValues', (test) => {
        let templates = [
            '{% macro foo(name = "a #{foo} a") %}{% endmacro %}',
            '{% macro foo(name = [["b", "a #{foo} a"]]) %}{% endmacro %}'
        ];

        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let parser = getParser(env);

        for (let template of templates) {
            let source = new TwingSource(template, 'index');
            let stream = env.tokenize(source);

            try {
                parser.parse(stream);

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A default value for an argument must be a constant (a boolean, a string, a number, or an array) in "index" at line 1.');
            }
        }

        test.end();
    });

    test.test('macroDefinitionSupportsConstantDefaultValues', (test) => {
        let templates = [
            '{% macro foo(name = "aa") %}{% endmacro %}',
            '{% macro foo(name = 12) %}{% endmacro %}',
            '{% macro foo(name = true) %}{% endmacro %}',
            '{% macro foo(name = ["a"]) %}{% endmacro %}',
            '{% macro foo(name = [["a"]]) %}{% endmacro %}',
            '{% macro foo(name = {a: "a"}) %}{% endmacro %}',
            '{% macro foo(name = {a: {b: "a"}}) %}{% endmacro %}'
        ];

        const loader = new MockLoader();
        const env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        const parser = getParser(env);

        for (const template of templates) {
            const source = new TwingSource(template, 'index');
            const stream = env.tokenize(source);

            test.ok(parser.parse(stream), 'should not throw an error');
        }

        test.end();
    });

    test.test('unknownFunction', ({test}) => {
        test('strict mode', ({same, fail, end}) => {
            let loader = new MockLoader();
            let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
            let source = new TwingSource('{{ cycl() }}', 'index');

            for (let parser of [
                getParser(env),
                getParser(env, {
                    strict: true
                })
            ]) {
                try {
                    let stream = env.tokenize(source);

                    parser.parse(stream);

                    fail();
                } catch (e: any) {
                    same(e.name, 'TwingErrorSyntax');
                    same(e.message, 'Unknown "cycl" function. Did you mean "cycle" in "index" at line 1?');
                }

            }

            end();
        });

        test('loose mode', ({fail, end, assert}) => {
            let loader = new MockLoader();
            let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
            let source = new TwingSource('{{ cycl(5) }}', 'index');
            let stream = env.tokenize(source);
            let parser = getParser(env, {
                strict: false
            });

            try {
                const moduleNode = parser.parse(stream);
                const {body} = moduleNode.children;

                assert(
                    body.children.content.is("print")
                    && body.children.content.children.expr.is("call")
                    && body.children.content.children.expr.attributes.type === "function"
                    && body.children.content.children.expr.attributes.operatorName === 'cycl'
                    && body.children.content.children.expr.children.arguments.children[0].is("expression_constant")
                    && body.children.content.children.expr.children.arguments.children[0].attributes.value === 5
                );
            } catch (e: any) {
                fail();
            }

            end();
        });
    });

    test.test('unknownFunctionWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{{ foobar() }}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "foobar" function in "index" at line 1.');
        }

        test.end();
    });

    test.test('unknownFilter', ({test}) => {
        test('strict mode', ({fail, same, end}) => {
            let loader = new MockLoader();
            let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
            let source = new TwingSource('{{  1|lowe }}', 'index');

            for (let parser of [
                getParser(env),
                getParser(env, {
                    strict: true
                })
            ]) {
                let stream = env.tokenize(source);

                try {
                    parser.parse(stream);

                    fail();
                } catch (e: any) {
                    same(e.name, 'TwingErrorSyntax');
                    same(e.message, 'Unknown "lowe" filter. Did you mean "lower" in "index" at line 1?');
                }
            }

            end();
        });

        test('loose mode', ({fail, end, assert}) => {
            let loader = new MockLoader();
            let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
            let source = new TwingSource('{{  1|lowe(5) }}', 'index');
            let stream = env.tokenize(source);
            let parser = getParser(env, {
                strict: false
            });

            try {
                const moduleNode = parser.parse(stream);
                const {body} = moduleNode.children;

                assert(body.children.content.is("print")
                    && body.children.content.children.expr.is("call")
                    && body.children.content.children.expr.attributes.type === "filter"
                    && body.children.content.children.expr.attributes.operatorName === "lowe"
                    && body.children.content.children.expr.children.operand.is("expression_constant")
                    && body.children.content.children.expr.children.operand.attributes.value === 1
                    && body.children.content.children.expr.children.arguments.children[0].is("expression_constant")
                    && body.children.content.children.expr.children.arguments.children[0].attributes.value === 5
                );

            } catch (e: any) {
                fail();
            }

            end();
        });
    });

    test.test('unknownFilterWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{{ 1|foobar }}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "foobar" filter in "index" at line 1.');
        }

        test.end();
    });

    test.test('unknownTest', ({test}) => {
        test('strict mode', ({same, fail, end}) => {
            let loader = new MockLoader();
            let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
            let source = new TwingSource('{{  1 is nul }}', 'index');

            for (let parser of [
                getParser(env),
                getParser(env, {
                    strict: true
                })
            ]) {
                let stream = env.tokenize(source);

                try {
                    parser.parse(stream);

                    fail();
                } catch (e: any) {
                    same(e.name, 'TwingErrorSyntax');
                    same(e.message, 'Unknown "nul" test. Did you mean "null" in "index" at line 1?');
                }
            }

            end();
        });

        test('loose mode', ({test}) => {
            test('one word', ({fail, end, assert}) => {
                let loader = new MockLoader();
                let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
                let source = new TwingSource('{{  1 is nul }}', 'index');
                let stream = env.tokenize(source);
                let parser = getParser(env, {
                    strict: false
                });

                try {
                    const moduleNode = parser.parse(stream);
                    const {body} = moduleNode.children;

                    assert(
                        body.children.content.is("print")
                        && body.children.content.children.expr.is("call")
                        && body.children.content.children.expr.attributes.type === "test"
                        && body.children.content.children.expr.attributes.operatorName === "nul"
                        && body.children.content.children.expr.children.operand.is("expression_constant")
                        && body.children.content.children.expr.children.operand.attributes.value === 1
                        && body.children.content.children.expr.children.arguments.children[0] === undefined
                    );
                } catch (e: any) {
                    fail();
                }

                end();
            });

            test('two words', ({fail, end, assert}) => {
                let loader = new MockLoader();
                let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
                let source = new TwingSource('{{  1 is so nul }}', 'index');
                let stream = env.tokenize(source);
                let parser = getParser(env, {
                    strict: false
                });

                try {
                    const moduleNode = parser.parse(stream);

                    assert(
                        moduleNode.children.body.children.content.is("print")
                        && moduleNode.children.body.children.content.children.expr.is("call")
                        && moduleNode.children.body.children.content.children.expr.attributes.type === 'test'
                        && moduleNode.children.body.children.content.children.expr.attributes.operatorName === 'so nul'
                        && moduleNode.children.body.children.content.children.expr.children.arguments.children[0] === undefined
                    );
                } catch (e: any) {
                    fail();
                }

                end();
            });
        });
    });

    test.test('unknownTestWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = createMockedEnvironment(loader, {cache: false, escapingStrategy: false});
        let source = new TwingSource('{{ 1 is not_even_remotely_something_supported}}', 'index');
        let stream = env.tokenize(source);
        let parser = getParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e: any) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "not_even_remotely_something_supported" test in "index" at line 1.');
        }

        test.end();
    });

    test.test('parseExpression', (test) => {
        let env = createEnvironment(new MockLoader());

        env.addExtension(new TwingTestExpressionParserExtension(), 'TwingTestExpressionParserExtension');

        let stream = new TwingTokenStream([
            new Token(TokenType.NUMBER, '1', 1, 1),
            new Token(TokenType.OPERATOR, 'with-callable', 1, 1),
            new Token(TokenType.NUMBER, '2', 1, 1),
            new Token(TokenType.VARIABLE_END, null, 1, 1)
        ]);

        let parser = getParser(env);

        Reflect.set(parser, 'stream', stream);

        let expression = parser.parseExpression();

        test.assert(
            expression.is("expression_constant")
            && expression.attributes.value === '3'
        );

        test.end();
    });

    test.test('getFunctionNode', (test) => {
        let env = createMockedEnvironment(new MockLoader());
        let parser = getParser(env);

        let stream = new TwingTokenStream([
            new Token(TokenType.PUNCTUATION, '(', 1, 1),
            new Token(TokenType.PUNCTUATION, ')', 1, 1),
            new Token(TokenType.VARIABLE_END, null, 1, 1)
        ], new TwingSource('', 'foo'));

        Reflect.set(parser, 'stream', stream);

        test.test('attribute', (test) => {
            try {
                parser.getFunctionNode('attribute', 1, 1);

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'The "attribute" function takes at least two arguments (the variable and the attributes) in "foo" at line 1.');
            }

            test.end();
        });

        test.test('parent', (test) => {
            let parser = getParser(env);

            let stream = new TwingTokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.VARIABLE_END, null, 1, 1)
            ], new TwingSource('', 'foo'));

            Reflect.set(parser, 'stream', stream);

            sinon.stub(parser, 'getBlockStack').returns([]);

            try {
                parser.getFunctionNode('parent', 1, 1);

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Calling "parent" outside a block is forbidden in "foo" at line 1.');
            }

            test.end();
        });

        test.test('deprecated function', (test) => {
            let env = createMockedEnvironment(new MockLoader());

            env.addExtension(new TwingTestExpressionParserExtension(), 'foo');

            let testCases: [string, boolean, string][] = [
                ['deprecated', false, 'Twing Function "deprecated" is deprecated in "index" at line 1.'],
                ['deprecated_with_version', false, 'Twing Function "deprecated_with_version" is deprecated since version 1 in "index" at line 1.'],
                ['deprecated_with_alternative', false, 'Twing Function "deprecated_with_alternative" is deprecated since version 1. Use "alternative" instead in "index" at line 1.'],
                ['deprecated', true, 'Twing Function "deprecated" is deprecated in "index.html.twig" at line 1.']
            ];

            let parser = getParser(env);

            sinon.stub(parser, 'getImportedSymbol').returns(null);

            for (let testCase of testCases) {
                let stream = new TwingTokenStream([
                    new Token(TokenType.PUNCTUATION, '(', 1, 1),
                    new Token(TokenType.PUNCTUATION, ')', 1, 1),
                    new Token(TokenType.VARIABLE_END, null, 1, 1)
                ], new TwingSource('', testCase[1] ? 'index.html.twig' : 'index'));

                Reflect.set(parser, 'stream', stream);

                let originalWrite = process.stdout.write;

                process.stdout.write = (chunk: string | Buffer): boolean => {
                    process.stdout.write = originalWrite;

                    test.same(chunk, testCase[2], testCase[0]);

                    return true;
                };

                parser.getFunctionNode(testCase[0], 1, 1);
            }

            test.end();
        });

        test.end();
    });

    test.test('parseHashExpression', (test) => {
        let env = createEnvironment(new MockLoader());

        test.test('with key as an expression', (test) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.PUNCTUATION, '{', 1, 1),
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.STRING, '1', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.PUNCTUATION, ':', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.PUNCTUATION, '}', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ]);

            let parser = getParser(env);

            Reflect.set(parser, 'stream', stream);

            let expression = parser.parseHashExpression();

            test.true(expression.is("hash"));

            test.end();
        });

        test.test('with key as an expression', (test) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.PUNCTUATION, '{', 1, 1),
                new Token(TokenType.OPERATOR, 'foo', 1, 1)
            ], new TwingSource('', 'foo'));

            let parser = getParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseHashExpression();

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "operator" of value "foo" in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseSubscriptExpression', (test) => {
        let env = createEnvironment(new MockLoader());

        test.test('with dot syntax and non-name/number token', (test) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.PUNCTUATION, '.', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new TwingSource('', 'foo'));

            let parser = getParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseSubscriptExpression(createConstantNode('foo', 1, 1));

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Expected name or number in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseTestExpression', (test) => {
        let env = createEnvironment(new MockLoader());

        test.test('with not existing 2-words test', (test) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.NAME, 'foo', 1, 1),
                new Token(TokenType.NAME, 'bar2', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new TwingSource('', 'foo'));

            let parser = getParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseTestExpression(createConstantNode(1, 1, 1));

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Unknown "foo bar2" test. Did you mean "foo bar" in "foo" at line 1?');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseArguments', (test) => {
        let env = createEnvironment(new MockLoader());

        test.test('with non-name named argument', (test) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.NUMBER, '5', 1, 1),
                new Token(TokenType.OPERATOR, '=', 1, 1),
                new Token(TokenType.NUMBER, '5', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1)
            ], new TwingSource('', 'foo'));

            let parser = getParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseArguments(true);

                test.fail();
            } catch (e: any) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A parameter name must be a string, "expression_constant" given in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseFilterExpressionRaw', (test) => {
        test.test('deprecated filter', (test) => {
            let env = createEnvironment(new MockLoader());

            env.addExtension(new TwingTestExpressionParserExtension(), 'foo');

            let testCases: [string, boolean, string][] = [
                ['deprecated', false, 'Twing Filter "deprecated" is deprecated in "index" at line 1.'],
                ['deprecated_with_version', false, 'Twing Filter "deprecated_with_version" is deprecated since version 1 in "index" at line 1.'],
                ['deprecated_with_alternative', false, 'Twing Filter "deprecated_with_alternative" is deprecated since version 1. Use "alternative" instead in "index" at line 1.'],
                ['deprecated', true, 'Twing Filter "deprecated" is deprecated in "index.html.twig" at line 1.']
            ];

            let parser = getParser(env);

            for (let testCase of testCases) {
                let stream = new TwingTokenStream([
                    new Token(TokenType.NAME, testCase[0], 1, 1),
                    new Token(TokenType.EOF, null, 1, 1)
                ], new TwingSource('', testCase[1] ? 'index.html.twig' : 'index'));

                Reflect.set(parser, 'stream', stream);

                let originalWrite = process.stdout.write;

                process.stdout.write = (chunk: Buffer | string): boolean => {
                    process.stdout.write = originalWrite;

                    test.same(chunk, testCase[2], testCase[0]);

                    return true;
                };

                parser.parseFilterExpressionRaw(createConstantNode(1, 1, 1), testCase[0]);
            }

            test.end();
        });

        test.end();
    });

    // todo: we should not have to unit test internal methods
    // test.test('parseArrow', (test) => {
    //     let env = createEnvironment(new MockLoader());
    //
    //     test.test('returns null when closing parenthesis is missing', (test) => {
    //         let stream = new TwingTokenStream([
    //             new Token(TokenType.PUNCTUATION, '(', 1, 1),
    //             new Token(TokenType.STRING, 'bar', 1, 1),
    //             new Token(TokenType.EOF, null, 1, 1)
    //         ], new TwingSource('', 'foo'));
    //
    //         let parser = new Parser(env);
    //
    //         Reflect.set(parser, 'stream', stream);
    //
    //         let expr = parser.parseArrow();
    //
    //         test.same(expr, null);
    //
    //         test.end();
    //     });
    //
    //     test.test('returns null when arrow is missing', (test) => {
    //         let stream = new TwingTokenStream([
    //             new Token(TokenType.PUNCTUATION, '(', 1, 1),
    //             new Token(TokenType.STRING, 'bar', 1, 1),
    //             new Token(TokenType.PUNCTUATION, ')', 1, 1),
    //             new Token(TokenType.STRING, '=>', 1, 1),
    //             new Token(TokenType.EOF, null, 1, 1)
    //         ], new TwingSource('', 'foo'));
    //
    //         let parser = new Parser(env);
    //
    //         Reflect.set(parser, 'stream', stream);
    //
    //         let expr = parser.parseArrow();
    //
    //         test.same(expr, null);
    //
    //         test.end();
    //     });
    //
    //     test.test('with non-name token', (test) => {
    //         let stream = new TwingTokenStream([
    //             new Token(TokenType.PUNCTUATION, '(', 1, 1),
    //             new Token(TokenType.STRING, 'bar', 1, 1),
    //             new Token(TokenType.PUNCTUATION, ')', 1, 1),
    //             new Token(TokenType.ARROW, '=>', 1, 1),
    //             new Token(TokenType.EOF, null, 1, 1)
    //         ], new TwingSource('', 'foo'));
    //
    //         let parser = new Parser(env);
    //
    //         Reflect.set(parser, 'stream', stream);
    //
    //         try {
    //             parser.parseArrow();
    //
    //             test.fail('should throw an error');
    //         } catch (e: any) {
    //             test.same(e.getMessage(), 'Unexpected token "string" of value "bar" in "foo" at line 1.');
    //         }
    //
    //         test.end();
    //     });
    //
    //     test.end();
    // });

    test.end();
});
