import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../src/lib/node/expression/constant";
import {createStartsWithNode} from "../../../../../../../../src/lib/node/expression/binary/starts-with";
import {createMockCompiler} from "../../../../../../../mock/compiler";

tape('StartsWithNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createStartsWithNode([left, right], 1, 1);

        same(node.children.left, left);
        same(node.children.right, right);
        same(node.type, 'starts_with');

        end();
    });

    test('compile', ({same, end}) => {
        let left = createConstantNode(1, 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createStartsWithNode([left, right], 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, 'await (async () => {let left = 1; let right = 2; return typeof left === \'string\' && typeof right === \'string\' && (right.length < 1 || left.startsWith(right));})()');

        end();
    });
});
