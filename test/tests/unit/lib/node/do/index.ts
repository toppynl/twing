import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createDoNode} from "../../../../../../src/lib/node/do";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('DoNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createDoNode(expr, 1, 1);

        same(node.children.expr, expr);
        same(node.type, 'do');

        end();
    });

    test('compile', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createDoNode(expr, 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `\`foo\`;
`);

        end();
    });
});
