import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createInlinePrintNode} from "../../../../../../src/lib/node/inline-print";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('node/inline-print', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createInlinePrintNode(expr, 1, 1);

        same(node.children.node, expr);
        same(node.type, 'inline_print');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let node = createInlinePrintNode(createConstantNode('foo', 1, 1), 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(\`foo\`)`);

        end();
    });
});
