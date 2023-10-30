import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createNameNode} from "../../../../../../../src/lib/node/expression/name";
import {createArrayNode} from "../../../../../../../src/lib/node/expression/array";
import {createGetAttributeNode} from "../../../../../../../src/lib/node/expression/get-attribute";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('GetAttributeNode', ({test}) => {
    test('factory', ({same, end}) => {
        const expr = createNameNode('foo', 1, 1);
        const attr = createConstantNode('bar', 1, 1);
        const args = createArrayNode({}, 1, 1);
        args.addElement(createNameNode('foo', 1, 1));
        args.addElement(createConstantNode('bar', 1, 1));
        const node = createGetAttributeNode(expr, attr, args, "array", 1, 1);

        same(node.children.node, expr);
        same(node.children.attribute, attr);
        same(node.children.arguments, args);
        same(node.attributes.type, "array");
        same(node.line, 1);
        same(node.column,1);

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let expr = createNameNode('foo', 1, 1);
        let attr = createConstantNode('bar', 1, 1);
        let args = createArrayNode({}, 1, 1);
        let node = createGetAttributeNode(expr, attr, args, "any", 1, 1);

        same(compiler.compile(node).source, `await template.traceableMethod(runtime.getAttribute, 1, template.source)(runtime, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([]), \`any\`, false, false, false)`);

        node = createGetAttributeNode(expr, attr, args, "array", 1, 1);

        same(compiler.compile(node).source, `await (async () => {let object = (context.has(\`foo\`) ? context.get(\`foo\`) : null); return runtime.get(object, \`bar\`);})()`);

        args = createArrayNode({}, 1, 1);
        args.addElement(createNameNode('foo', 1, 1));
        args.addElement(createConstantNode('bar', 1, 1));
        node = createGetAttributeNode(expr, attr, args, "method", 1, 1);

        same(compiler.compile(node).source, `await template.traceableMethod(runtime.getAttribute, 1, template.source)(runtime, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([[0, (context.has(\`foo\`) ? context.get(\`foo\`) : null)], [1, \`bar\`]]), \`method\`, false, false, false)`);

        end();
    });
});
