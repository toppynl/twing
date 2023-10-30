import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createSandboxedPrintNode} from "../../../../../../src/lib/node/sandboxed-print";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('SandboxedPrintNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr = createConstantNode('foo', 1, 1);
        let node = createSandboxedPrintNode(expr, 1, 1);

        same(node.children.expr, expr);
        same(node.type, 'sandboxed_print');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let node = createSandboxedPrintNode(createConstantNode('foo', 1, 1), 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(this.environment.ensureToStringAllowed(\`foo\`));
`);

        end();
    });
});
