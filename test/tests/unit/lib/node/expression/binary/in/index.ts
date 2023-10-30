import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createInNode,} from "../../../../../../../../src/lib/node/expression/binary/in";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('InNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createInNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'in');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createInNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, 'this.isIn(1, 2)');

        end();
    });
});
