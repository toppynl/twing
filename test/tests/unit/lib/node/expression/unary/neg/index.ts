import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createNegativeNode} from "../../../../../../../../src/lib/node/expression/unary/neg";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('NegativeNode', ({test}) => {
    test('factory', ({same, end}) => {
        let operand = createConstantNode(1, 1, 1);
        let node = createNegativeNode(operand, 1, 1);

        same(node.children.operand, operand);
        same(node.type, 'neg');

        end();
    });

    test('compile', ({test}) => {
        let compiler = createMockCompiler();

        test('basic', ({same, end}) => {
            let expr = createConstantNode(1, 1, 1);
            let node = createNegativeNode(expr, 1, 1);

            same(compiler.compile(node).source, '-(1)');

            end();
        });

        test('with unary neg as body', ({same, end}) => {
            let expr = createConstantNode(1, 1, 1);
            let node = createNegativeNode(createNegativeNode(expr, 1, 1), 1, 1);

            same(compiler.compile(node).source, '-(-(1))');

            end();
        });
    });
});
