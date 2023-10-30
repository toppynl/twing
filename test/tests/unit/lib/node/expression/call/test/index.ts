import * as tape from 'tape';
import {createConstantNode, ConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createTestNode} from "../../../../../../../../src/lib/node/expression/call/test";
import {MockEnvironment} from "../../../../../../../mock/environment";
import {TwingTest} from "../../../../../../../../src/lib/test";
import {createMockCompiler} from "../../../../../../../mock/compiler";

import "./constant";
import "./defined";
import {ExpressionNode} from "../../../../../../../../src/lib/node/expression";
import {createArgumentsNode} from "../../../../../../../../src/lib/node/expression/arguments";

function twig_tests_test_barbar() {
    return Promise.resolve(true);
}

function createCandidate(
    operand: ConstantNode,
    name: string,
    args: Record<string, ExpressionNode>
) {
    return createTestNode(operand, name, createArgumentsNode(args, 1, 1), 1, 1);
}

tape('TestNode', ({test}) => {
    test('factory', ({same, end}) => {
        let operand = createConstantNode('foo', 1, 1);
        let name = 'null';
        let node = createCandidate(operand, name, {});

        same(node.children.operand, operand);
        same(node.children.arguments.children, {});
        same(node.attributes.operatorName, name);
        same(node.type, 'test');

        end();
    });

    test('compile', ({test}) => {
        let environment = new MockEnvironment();

        environment.addTest(new TwingTest('testThatIsVariadicAndNeedsContext', twig_tests_test_barbar, [
            {name: 'arg1', defaultValue: null},
            {name: 'arg2', defaultValue: null}
        ], {
            is_variadic: true,
            needs_context: true
        }));
        environment.addTest(new TwingTest('anonymous', () => Promise.resolve(true), []));

        let compiler = createMockCompiler(environment);

        test('test as an anonymous function', ({same, end}) => {
            let node = createCandidate(
                createConstantNode('foo', 1, 1),
                'anonymous',
                {
                    0: createConstantNode('foo', 1, 1)
                }
            );

            same(compiler.compile(node).source, 'await this.environment.getTest(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`, \`foo\`])');

            end();
        });

        test('arbitrary named arguments', ({same, end}) => {
            let string = createConstantNode('abc', 1, 1);
            let node = createCandidate(
                string,
                'testThatIsVariadicAndNeedsContext',
                {}
            );

            same(compiler.compile(node).source, 'await this.environment.getTest(\'testThatIsVariadicAndNeedsContext\').traceableCallable(1, this.source)(...[context, \`abc\`])');

            node = createCandidate(string, 'testThatIsVariadicAndNeedsContext', {
                foo: createConstantNode('bar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getTest(\'testThatIsVariadicAndNeedsContext\').traceableCallable(1, this.source)(...[context, \`abc\`, null, null, new Map([[\`foo\`, \`bar\`]])])');

            node = createCandidate(string, 'testThatIsVariadicAndNeedsContext', {
                0: createConstantNode('1', 1, 1),
                1: createConstantNode('2', 1, 1),
                2: createConstantNode('3', 1, 1),
                foo: createConstantNode('bar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getTest(\'testThatIsVariadicAndNeedsContext\').traceableCallable(1, this.source)(...[context, \`abc\`, \`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

            end();
        });
    });
});
