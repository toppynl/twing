import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createPositiveNode} from "../../../../../../../../src/lib/node/expression/unary/pos";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('PositiveNode', ({test}) => {
    test('factory', ({same, end}) => {
        let operand = createConstantNode(1, 1, 1);
        let node = createPositiveNode(operand, 1, 1);

        same(node.children.operand, operand);
        same(node.type, 'pos');

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();
        let expr = createConstantNode(1, 1, 1);
        let node = createPositiveNode(expr, 1, 1);

        same(compiler.compile(node).source, '+(1)');

        end();
    });
});
