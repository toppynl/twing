import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createFilterNode} from "../../../../../../../../src/lib/node/expression/call/filter";
import {createMockCompiler} from "../../../../../../../mock/compiler";
import {TwingFilter} from "../../../../../../../../src/lib/filter";
import {MockEnvironment} from "../../../../../../../mock/environment";
import {MockLoader} from "../../../../../../../mock/loader";

import "./default";
import {createArgumentsNode} from "../../../../../../../../src/lib/node/expression/arguments";

function twig_tests_filter_dummy() {
    return Promise.resolve();
}

function twig_tests_filter_barbar() {
    return Promise.resolve();
}

const anonymousFilter = new TwingFilter('anonymous', () => Promise.resolve(), []);

const needsTemplateFilter = new TwingFilter('needsTemplate', twig_tests_filter_dummy, [], {
    needs_template: true
});

const filterWithTwoNonMandatoryArguments = new TwingFilter('filterWithTwoNonMandatoryArguments', twig_tests_filter_barbar, [
    {name: 'arg1', defaultValue: null},
    {name: 'arg2', defaultValue: null}
], {
    needs_context: true,
    is_variadic: true
});

tape('FilterNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let name = 'upper';
        let args = createArgumentsNode({}, 1, 1);
        let node = createFilterNode(
            expr,
            name,
            args,
            1, 1
        );

        same(node.children.operand, expr);
        same(node.attributes.operatorName, name);
        same(node.children.arguments, args);

        end();
    });

    test('compile', ({test}) => {
        const environment = new MockEnvironment(new MockLoader());
        const compiler = createMockCompiler(environment);

        environment.addFilter(filterWithTwoNonMandatoryArguments);
        environment.addFilter(anonymousFilter);
        environment.addFilter(needsTemplateFilter);

        test('basic', ({same, end}) => {
            let expr = createConstantNode('foo', 1, 1);
            let node = createFilterNode(
                expr,
                'upper',
                createArgumentsNode({}, 1, 1),
                1, 1
            );

            let argumentsNode = createArgumentsNode({
                0: createConstantNode(2, 1, 1),
                1: createConstantNode('.', 1, 1),
                2: createConstantNode(',', 1, 1)
            }, 1, 1);

            node = createFilterNode(node, 'number_format', argumentsNode, 1, 1);

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'number_format\').traceableCallable(1, this.source)(...[this, await this.environment.getFilter(\'upper\').traceableCallable(1, this.source)(...[\`foo\`]), 2, \`.\`, \`,\`])');

            end();
        });

        test('named arguments', ({same, end}) => {
            let date = createConstantNode(0, 1, 1);

            let node = createFilterNode(
                date,
                'date',
                createArgumentsNode({
                    timezone: createConstantNode('America/Chicago', 1, 1),
                    format: createConstantNode('d/m/Y H:i:s P', 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'date\').traceableCallable(1, this.source)(...[this, 0, \`d/m/Y H:i:s P\`, \`America/Chicago\`])');

            end();
        });

        test('skip an optional argument', ({same, end}) => {
            let date = createConstantNode(0, 1, 1);
            let node = createFilterNode(
                date,
                'date',
                createArgumentsNode({
                    timezone: createConstantNode('America/Chicago', 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'date\').traceableCallable(1, this.source)(...[this, 0, null, \`America/Chicago\`])');

            end();
        });

        test('underscores vs camelCase for named arguments', ({same, end}) => {
            let string = createConstantNode('abc', 1, 1);
            let node = createFilterNode(
                string,
                'reverse',
                createArgumentsNode({
                    preserve_keys: createConstantNode(true, 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'reverse\').traceableCallable(1, this.source)(...[\`abc\`, true])');

            string = createConstantNode('abc', 1, 1);
            node = createFilterNode(
                string,
                'reverse',
                createArgumentsNode({
                    preserveKeys: createConstantNode(true, 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'reverse\').traceableCallable(1, this.source)(...[\`abc\`, true])');

            end();
        });

        test('filter as an anonymous function', ({same, end}) => {
            const node = createFilterNode(
                createConstantNode('foo', 1, 1),
                'anonymous',
                createArgumentsNode({}, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`])');

            end();
        });

        test('needs template', ({same, end}) => {
            let string = createConstantNode('abc', 1, 1);
            let node = createFilterNode(
                string,
                'needsTemplate',
                createArgumentsNode({}, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'needsTemplate\').traceableCallable(1, this.source)(...[this, \`abc\`])');

            let argsNodes = createArgumentsNode({
                0: createConstantNode('bar', 1, 1)
            }, 1, 1);

            node = createFilterNode(string, 'needsTemplate', argsNodes, 1, 1);

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'needsTemplate\').traceableCallable(1, this.source)(...[this, \`abc\`, \`bar\`])');

            end();
        });

        test('arbitrary named arguments', ({same, end}) => {
            let operand = createConstantNode('abc', 1, 1);
            let node = createFilterNode(
                operand,
                'filterWithTwoNonMandatoryArguments',
                createArgumentsNode({}, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'filterWithTwoNonMandatoryArguments\').traceableCallable(1, this.source)(...[context, \`abc\`])');

            node = createFilterNode(
                operand,
                'filterWithTwoNonMandatoryArguments',
                createArgumentsNode({
                    foo: createConstantNode('bar', 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'filterWithTwoNonMandatoryArguments\').traceableCallable(1, this.source)(...[context, \`abc\`, null, null, new Map([[\`foo\`, \`bar\`]])])');

            node = createFilterNode(
                operand,
                'filterWithTwoNonMandatoryArguments',
                createArgumentsNode({
                    arg2: createConstantNode('bar', 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'filterWithTwoNonMandatoryArguments\').traceableCallable(1, this.source)(...[context, \`abc\`, null, \`bar\`])');

            node = createFilterNode(
                operand,
                'filterWithTwoNonMandatoryArguments',
                createArgumentsNode({
                    0: createConstantNode('1', 1, 1),
                    1: createConstantNode('2', 1, 1),
                    2: createConstantNode('3', 1, 1),
                    foo: createConstantNode('bar', 1, 1)
                }, 1, 1),
                1, 1
            );

            same(compiler.compile(node).source, 'await this.environment.getFilter(\'filterWithTwoNonMandatoryArguments\').traceableCallable(1, this.source)(...[context, \`abc\`, \`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

            end();
        });

        test('compileWithWrongNamedArgumentName', ({same, fail, end}) => {
            const operand = createConstantNode(0, 1, 1);
            const node = createFilterNode(
                operand,
                'date',
                createArgumentsNode({
                    foobar: createConstantNode('America/Chicago', 1, 1)
                }, 1, 1),
                1, 1
            );

            try {
                compiler.compile(node);

                fail();
            } catch (e: any) {
                same(e.message, 'Unknown argument "foobar" for filter "date(format, timezone)" at line 1.');
            }

            end();
        });

        test('compileWithMissingNamedArgument', ({same, fail, end}) => {
            const operand = createConstantNode(0, 1, 1);
            const node = createFilterNode(
                operand,
                'replace',
                createArgumentsNode({
                    to: createConstantNode('foo', 1, 1)
                }, 1, 1),
                1, 1
            );

            try {
                compiler.compile(node);

                fail();
            } catch (e: any) {
                same(e.message, 'Value for argument "from" is required for filter "replace" at line 1.');
            }

            end();
        });
    });
});
