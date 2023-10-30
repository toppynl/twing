import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createNotEqualToNode} from "../../../../../../../../src/lib/node/expression/binary/not-equal";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('NotEqualToNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createNotEqualToNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'not_equal');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createNotEqualToNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, '!this.compare(1, 2)');

        end();
    });
});
