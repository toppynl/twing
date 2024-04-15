import * as tape from 'tape';
import {createNodeTraverser} from "../../../../../src/lib/node-traverser";
import {TwingBaseNode, createBaseNode} from "../../../../../src/lib/node";
import {createNodeVisitor, TwingNodeVisitor} from "../../../../../src/lib/node-visitor";

const createRemoveNodeToRemoveNodeVisitor = (
    nodeToRemove: TwingBaseNode
): TwingNodeVisitor => {
    return createNodeVisitor(
        (node) => {
            return node;
        },
        (node) => {
            if (node === nodeToRemove) {
                return null;
            }

            return node;
        }
    );
};

tape('node-traverser', (test) => {
    test.test('constructor', (test) => {
        test.doesNotThrow(function () {
            createNodeTraverser([]);
        });

        test.end();
    });

    test.test('traverseForVisitor', (test) => {
        const nodeToRemove = createBaseNode(null);
        const nodeToKeep = createBaseNode('foo');
        const visitor = createRemoveNodeToRemoveNodeVisitor(nodeToRemove);
        const traverse = createNodeTraverser([
            visitor
        ]);
        const node = traverse(createBaseNode(null, {}, {
            0: nodeToRemove,
            1: nodeToKeep
        }), {
            name: 'name',
            code: 'code'
        });

        test.same(node?.children[0], undefined);
        test.same(node?.children[1].type, 'foo');

        test.end();
    });


    test.end();
});
