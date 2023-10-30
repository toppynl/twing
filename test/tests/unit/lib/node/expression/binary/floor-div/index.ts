import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createFloorDivNode} from "../../../../../../../../src/lib/node/expression/binary/floor-div";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('FloorDivNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createFloorDivNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'floor_div');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createFloorDivNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, 'Math.floor((1 / 2))');

        end();
    });
});
