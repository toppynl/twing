import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createGreaterThanOrEqualToNode,} from "../../../../../../../../src/lib/node/expression/binary/greater-equal";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('GreaterThanOrEqualNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createGreaterThanOrEqualToNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'greater_equal');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createGreaterThanOrEqualToNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, '(1 >= 2)');

        end();
    });
});
