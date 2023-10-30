import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createDeprecatedNode} from "../../../../../../src/lib/node/deprecated";
import {createMockCompiler} from "../../../../../mock/compiler";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";

tape('DeprecatedNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createDeprecatedNode(expr, 1, 1);

        same(node.children.expr, expr);
        same(node.type, 'deprecated');

        end();
    });

    test('compile', ({test}) => {
        test('with constant', ({same, end}) => {
            let expr = createConstantNode('foo', 1, 1);
            let node = createDeprecatedNode(expr, 1, 1);
            let compiler = createMockCompiler();

            node.setTemplateName('bar');

            same(compiler.compile(node).source, `{
    console.warn(\`foo\` + \` ("bar" at line 1)\`);
}
`);

            end();
        });

        test('with variable', ({same, end}) => {
            let expr = createNameNode('foo', 1, 1);
            let node = createDeprecatedNode(expr, 1, 1);
            let compiler = createMockCompiler();

            node.setTemplateName('bar');

            same(compiler.compile(node).source, `{
    let message = (context.has(\`foo\`) ? context.get(\`foo\`) : null);
    console.warn(message + \` ("bar" at line 1)\`);
}
`);

            end();
        });
    });
});
