import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createRangeNode} from "../../../../../../../../src/lib/node/expression/binary/range";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('RangeNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createRangeNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'range');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createRangeNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, 'this.createRange(1, 2)');

        end();
    });
});
