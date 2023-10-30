import * as tape from "tape";
import {createBaseExpressionNode} from "../../../../../../src/lib/node/expression/base-expression";
import {createConstantNode} from "../../../../../../src";

tape('BaseExpressionNode', ({test}) => {
    test('factory', ({same, end}) => {
        const node = createBaseExpressionNode({
            optimizable: true,
            ignore_strict_check: true
        }, {}, 1, 1);

        console.log(node);

        same(node.is("expression"), true);
        same(node.is("node"), false);
        same(node.attributes.optimizable, true);

        const constantNode = createConstantNode(5, 1, 1);

        console.log(constantNode);

        same(constantNode.is("expression_constant"), true);
        same(constantNode.is("expression"), true);
        same(node.attributes.optimizable, true)

        end();
    });
});
