import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createMockCompiler} from "../../../../../../../mock/compiler";
import {createLessThanNode,} from "../../../../../../../../src/lib/node/expression/binary/less";

tape('node/expression/binary/less', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createLessThanNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'less');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createLessThanNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, '(1 < 2)');

        end();
    });
});
