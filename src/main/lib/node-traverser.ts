import {TwingNodeVisitor} from "./node-visitor";
import {TwingBaseNode, getChildren} from "./node";
import type {TwingSource} from "./source";

/**
 * TwingNodeTraverser is a node traverser.
 *
 * It visits all nodes and their children and calls the registered visitors for each.
 */
export type TwingNodeTraverser = (node: TwingBaseNode, source: TwingSource) => TwingBaseNode | null;

export const createNodeTraverser = (
    visitors: Array<TwingNodeVisitor>
): TwingNodeTraverser => {
    const traverseWithVisitor = (visitor: TwingNodeVisitor, node: TwingBaseNode, source: TwingSource) => {
        node = visitor.enterNode(node, source);

        for (const [key, child] of getChildren(node)) {
            const newChild = traverseWithVisitor(visitor, child, source);

            if (newChild) {
                if (newChild !== child) {
                    node.children[key] = newChild;
                }
            } else {
                delete node.children[key];
            }
        }

        return visitor.leaveNode(node, source);
    };

    return (node, template) => {
        let result: TwingBaseNode | null = node;

        for (const visitor of visitors) {
            result = traverseWithVisitor(visitor, node, template);
        }

        return result;
    };
};
