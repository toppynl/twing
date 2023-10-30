import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createPrintNode} from "../../../../../../src/lib/node/print";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('PrintNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createPrintNode(expr, 1, 1);

        same(node.children.expr, expr);
        same(node.type, 'print');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let node = createPrintNode(createConstantNode('foo', 1, 1), 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(\`foo\`);
`);

        end();
    });
});
