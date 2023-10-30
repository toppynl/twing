import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createIncludeNode} from "../../../../../../src/lib/node/include";
import {createArrayNode} from "../../../../../../src/lib/node/expression/array";
import {createMockCompiler} from "../../../../../mock/compiler";
import {createConditionalNode} from "../../../../../../src/lib/node/expression/conditional";
import {createHashNode} from "../../../../../../src/lib/node/expression/hash";

tape('IncludeNode', ({test}) => {
    test('factory', ({same, end}) => {
        const expr = createConstantNode('foo.twig', 1, 1);

        let node = createIncludeNode(expr, null, false, false, 1, 1);

        same(node.children.variables, null);
        same(node.children.expression, expr);
        same(node.attributes.only, false);

        const variables = createArrayNode({
            0: createConstantNode('foo', 1, 1),
            1: createConstantNode(true, 1, 1)
        }, 1, 1);

        node = createIncludeNode(expr, variables, true, false, 1, 1);

        same(node.children.variables, variables);
        same(node.attributes.only, true);
        same(node.type, 'include');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        let compiler = createMockCompiler();

        test('basic', ({same, end}) => {
            const expr = createConstantNode('foo.twig', 1, 1);
            const node = createIncludeNode(expr, null, false, false, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, undefined, true, false, 1));
`);
            end();
        });

        test('with condition', ({same, end}) => {
            const expr = createConditionalNode(
                createConstantNode(true, 1, 1),
                createConstantNode('foo', 1, 1),
                createConstantNode('foo', 1, 1),
                0, 1
            );

            const node = createIncludeNode(expr, null, false, false, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, ((true) ? (\`foo\`) : (\`foo\`)), undefined, true, false, 1));
`);
            end();
        });

        test('with variables', ({same, end}) => {
            const expr = createConstantNode('foo.twig', 1, 1);

            const variables = createHashNode({
                0: createConstantNode('foo', 1, 1),
                1: createConstantNode(true, 1, 1)
            }, 1, 1);

            const node = createIncludeNode(expr, variables, false, false, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), true, false, 1));
`);
            end();
        });

        test('with variables only', ({same, end}) => {
            let expr = createConstantNode('foo.twig', 1, 1);

            const variables = createHashNode({
                0: createConstantNode('foo', 1, 1),
                1: createConstantNode(true, 1, 1)
            }, 1, 1);

            let node = createIncludeNode(expr, variables, true, false, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), false, false, 1));
`);
            end();
        });

        test('with only and no variables', ({same, end}) => {
            let expr = createConstantNode('foo.twig', 1, 1);
            let node = createIncludeNode(expr, null, true, false, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, undefined, false, false, 1));
`);
            end();
        });

        test('with ignore missing', ({same, end}) => {
            let expr = createConstantNode('foo.twig', 1, 1);

            const variables = createHashNode({
                0: createConstantNode('foo', 1, 1),
                1: createConstantNode(true, 1, 1)
            }, 1, 1);
            let node = createIncludeNode(expr, variables, true, true, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), false, true, 1));
`);
            end();
        });
    });
});
