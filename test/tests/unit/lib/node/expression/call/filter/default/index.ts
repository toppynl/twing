import * as tape from 'tape';
import {createDefaultFilterNode} from "../../../../../../../../../src/lib/node/expression/call/filter/default";
import {createNameNode} from "../../../../../../../../../src/lib/node/expression/name";
import {createBaseNode} from "../../../../../../../../../src/lib/node";
import {createMockCompiler} from "../../../../../../../../mock/compiler";
import {createConstantNode, createGetAttributeNode} from "../../../../../../../../../src";
import {createArgumentsNode} from "../../../../../../../../../src/lib/node/expression/arguments";

tape('DefaultFilterNode', ({test}) => {
    test('compile', ({test}) => {
        test('when filter is \`default\` and \`EXPRESSION_NAME\` or \`EXPRESSION_GET_ATTR\` node', ({same, end}) => {
            let node = createDefaultFilterNode(
                createNameNode('foo', 1, 1),
                createBaseNode(null),
                1, 1
            );

            const compiler = createMockCompiler();

            same(compiler.compile(node).source, `(((context.has(\`foo\`))) ? (await runtime.getFilter('default').traceableCallable(1, template.source)(...[(context.has(\`foo\`) ? context.get(\`foo\`) : null)])) : (\`\`))`);

            end();
        });

        test('when applied to a "get attribute" node', ({same, end}) => {
            let node = createDefaultFilterNode(
                createGetAttributeNode(
                    createNameNode('foo', 1, 1),
                    createConstantNode(0, 1, 1),
                    createArgumentsNode({}, 1, 1),
                    "array",
                    1, 1
                ),
                createBaseNode(null),
                1, 1
            );

            const compiler = createMockCompiler();

            same(compiler.compile(node).source, `((await template.traceableMethod(runtime.getAttribute, 1, template.source)(runtime, (context.has(\`foo\`) ? context.get(\`foo\`) : null), 0, , \`array\`, true, true, false)) ? (await runtime.getFilter('default').traceableCallable(1, template.source)(...[await (async () => {let object = (context.has(\`foo\`) ? context.get(\`foo\`) : null); return runtime.get(object, 0);})()])) : (\`\`))`);

            end();
        });
    });
});
