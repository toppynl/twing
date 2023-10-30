import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createConcatNode} from "../../../../../../../../src/lib/node/expression/binary/concat";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('ConcatNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createConcatNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'concat');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createConcatNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, '(this.concatenate(1, 2))');

        end();
    });
});
