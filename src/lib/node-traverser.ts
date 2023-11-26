import {TwingNodeVisitor} from "./node-visitor";
import {TwingBaseNode, getChildren, TwingNode} from "./node";

/**
 * TwingNodeTraverser is a node traverser.
 *
 * It visits all nodes and their children and calls the registered visitors for each.
 */
export type TwingNodeTraverser = (node: TwingBaseNode) => TwingBaseNode | null;

export const createNodeTraverser = (
    visitors: Array<TwingNodeVisitor>
): TwingNodeTraverser => {
    const traverseWithVisitor = (visitor: TwingNodeVisitor, node: TwingBaseNode) => {
        node = visitor.enterNode(node);

        for (const [key, child] of getChildren(node)) {
            const newChild = traverseWithVisitor(visitor, child);

            if (newChild) {
                if (newChild !== child) {
                    node.children[key] = newChild;
                }
            } else {
                delete node.children[key];
            }
        }

        return visitor.leaveNode(node);
    };

    return (node) => {
        let result: TwingNode | null = node;
        
        for (const visitor of visitors) {
            result = traverseWithVisitor(visitor, node);
        }

        return result;
    };
};
