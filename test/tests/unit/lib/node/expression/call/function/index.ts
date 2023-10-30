import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {
    createFunctionNode
} from "../../../../../../../../src/lib/node/expression/call/function";
import {MockEnvironment} from "../../../../../../../mock/environment";
import {TwingFunction} from "../../../../../../../../src/lib/function";
import {createMockCompiler} from "../../../../../../../mock/compiler";
import {createArgumentsNode} from "../../../../../../../../src/lib/node/expression/arguments";

function twig_tests_function_dummy() {
    return Promise.resolve();
}

function twig_tests_function_barbar() {
    return Promise.resolve();
}

function twig_tests_function_needs_source() {
    return Promise.resolve();
}

function createCandidate(name: string, args: Record<string, any> = {}) {
    return createFunctionNode(
        name,
        createArgumentsNode(args, 1, 1),
        1, 1
    );
}

tape('FunctionNode', ({test}) => {
    test('factory', ({same, end}) => {
        let name = 'function';
        let args = createArgumentsNode({}, 1, 1);
        let node = createFunctionNode(name, args, 1, 1);

        same(node.attributes.type, "function");
        same(node.attributes.operatorName, name);
        same(node.children.arguments, args);

        end();
    });

    test('compile', ({test}) => {
        let environment = new MockEnvironment();

        environment.addFunction(new TwingFunction('foo', twig_tests_function_dummy, [], {}));
        environment.addFunction(new TwingFunction('bar', twig_tests_function_dummy, [], {needs_template: true}));
        environment.addFunction(new TwingFunction('foofoo', twig_tests_function_dummy, [], {needs_context: true}));
        environment.addFunction(new TwingFunction('foobar', twig_tests_function_dummy, [], {
            needs_template: true,
            needs_context: true
        }));
        environment.addFunction(new TwingFunction('barbar', twig_tests_function_barbar, [
            {name: 'arg1', defaultValue: null},
            {name: 'arg2', defaultValue: null}
        ], {is_variadic: true}));
        environment.addFunction(new TwingFunction('anonymous', () => Promise.resolve(), []));
        environment.addFunction(new TwingFunction('needs_source', twig_tests_function_needs_source, [], {
            needs_template: true,
        }));

        let compiler = createMockCompiler(environment);

        test('basic', ({same, test}) => {
            let node = createCandidate('foo');

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foo\').traceableCallable(1, this.source)(...[])');

            node = createCandidate('foo', {
                0: createConstantNode('bar', 1, 1),
                1: createConstantNode('foobar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foo\').traceableCallable(1, this.source)(...[\`bar\`, \`foobar\`])');

            node = createCandidate('bar');

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'bar\').traceableCallable(1, this.source)(...[this])');

            node = createCandidate('bar', {
                0: createConstantNode('bar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'bar\').traceableCallable(1, this.source)(...[this, \`bar\`])');

            node = createCandidate('foofoo');

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foofoo\').traceableCallable(1, this.source)(...[context])');

            node = createCandidate('foofoo', {
                0: createConstantNode('bar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foofoo\').traceableCallable(1, this.source)(...[context, \`bar\`])');

            node = createCandidate('foobar');

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foobar\').traceableCallable(1, this.source)(...[this, context])');

            node = createCandidate('foobar', {
                0: createConstantNode('bar', 1, 1)
            });

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'foobar\').traceableCallable(1, this.source)(...[this, context, \`bar\`])');

            node = createCandidate('needs_source');

            same(compiler.compile(node).source, 'await this.environment.getFunction(\'needs_source\').traceableCallable(1, this.source)(...[this])');

            test('named arguments', ({same, end}) => {
                let node = createCandidate('date', {
                    timezone: createConstantNode('America/Chicago', 1, 1),
                    date: createConstantNode(0, 1, 1)
                });

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'date\').traceableCallable(1, this.source)(...[this, 0, \`America/Chicago\`])');

                end();
            });

            test('arbitrary named arguments', ({same, end}) => {
                let node = createCandidate('barbar');

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[])');

                node = createCandidate('barbar', {
                    foo: createConstantNode('bar', 1, 1)
                });

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[null, null, new Map([[\`foo\`, \`bar\`]])])');

                node = createCandidate('barbar', {
                    'arg2': createConstantNode('bar', 1, 1)
                });

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[null, \`bar\`])');

                node = createCandidate('barbar', {
                    0: createConstantNode('1', 1, 1),
                    1: createConstantNode('2', 1, 1),
                    2: createConstantNode('3', 1, 1),
                    foo: createConstantNode('bar', 1, 1)
                });

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[\`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

                end();
            });

            test('function as an anonymous function', ({same, end}) => {
                let node = createCandidate('anonymous', {
                    0: createConstantNode('foo', 1, 1)
                });

                same(compiler.compile(node).source, 'await this.environment.getFunction(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`])');

                end();
            });
        });
    });
});
