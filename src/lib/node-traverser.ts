import {TwingNodeVisitor} from "./node-visitor";
import {TwingBaseNode, getChildren, TwingNode} from "./node";

import {ksort} from "./helpers/ksort";
import {push} from "./helpers/push";

/**
 * TwingNodeTraverser is a node traverser.
 *
 * It visits all nodes and their children and calls the registered visitors for each.
 */
export type TwingNodeTraverser = (node: TwingBaseNode) => TwingBaseNode | null;

export const createNodeTraverser = (
    visitors: Array<TwingNodeVisitor>
): TwingNodeTraverser => {
    const visitorsByPriority: Map<number, Map<string, TwingNodeVisitor>> = new Map();

    for (const visitor of visitors) {
        
        let visitors = visitorsByPriority.get(visitor.priority);

        if (!visitors) {
            visitors = new Map();

            visitorsByPriority.set(visitor.priority, visitors);
        }

        push(visitors, visitor);
    }
    
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

        ksort(visitorsByPriority);

        for (const [, visitors] of visitorsByPriority) {
            for (const [, visitor] of visitors) {
                result = traverseWithVisitor(visitor, node);
            }
        }

        return result;
    };
};
