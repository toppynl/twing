import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createEndsWithNode} from "../../../../../../../../src/lib/node/expression/binary/ends-with";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('EndsWithNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createEndsWithNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'ends_with');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createEndsWithNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, 'await (async () => {let left = 1; let right = 2; return typeof left === \'string\' && typeof right === \'string\' && (right.length < 1 || left.endsWith(right));})()');

        end();
    });
});
