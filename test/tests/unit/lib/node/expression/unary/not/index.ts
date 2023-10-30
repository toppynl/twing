import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createNotNode} from "../../../../../../../../src/lib/node/expression/unary/not";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('NotNode', ({test}) => {
    test('factory', ({same, end}) => {
        let operand = createConstantNode(1, 1, 1);
        let node = createNotNode(operand, 1, 1);

        same(node.children.operand, operand);
        same(node.type, 'not');

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();
        let expr = createConstantNode(1, 1, 1);
        let node = createNotNode(expr, 1, 1);

        same(compiler.compile(node).source, '!(1)');

        end();

    });
});
