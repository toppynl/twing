import * as tape from "tape";
import {createBaseNode} from "../../../../../../src/lib/node";
import {spy} from "sinon";

tape('createBaseNode', ({test}) => {
    test('toString', ({test}) => {
        test('executes the toString method of every child', ({same, end}) => {
            const child0 = createBaseNode(null);
            const child1 = createBaseNode(null);

            const node = createBaseNode(null, {}, {
                0: child0,
                1: child1,
            });

            const child0ToStringSpy = spy(child0, "toString");
            const child1ToStringSpy = spy(child1, "toString");

            node.toString();

            same(child0ToStringSpy.callCount, 1);
            same(child1ToStringSpy.callCount, 1);

            end();
        });

        test('executes the toString method of every attribute that is a node', ({same, end}) => {
            const attributeNode = createBaseNode('attribute');

            const node = createBaseNode(null, {
                node: attributeNode,
                number: 5,
                array: [1, 2, 3],
                record: {1: 1, 2: 2, 3: 3}
            }, {});

            const attributeNodeToStringSpy = spy(attributeNode, "toString");

            const content = node.toString();

            same(attributeNodeToStringSpy.callCount, 1);
            same(content, `Node<null, node: Node<"attribute", line: 0, column: 0> (), number: 5, array: array (  0 => 1,  1 => 2,  2 => 3,), record: array (  1 => 1,  2 => 2,  3 => 3,), line: 0, column: 0> ()`);
            
            end();
        });
    });
});
