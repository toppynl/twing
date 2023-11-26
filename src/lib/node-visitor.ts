import type {TwingBaseNode} from "./node";
import {TwingNode} from "./node";

/**
 * The interface that all node visitors must implement.
 */
export interface TwingNodeVisitor {
    /**
     * Called before the passed node is visited.
     *
     * @return {TwingBaseNode} The modified node
     */
    enterNode(node: TwingBaseNode): TwingBaseNode;

    /**
     * Called after the passed node has been visited.
     *
     * @return {TwingBaseNode} The modified node or null if the node must be removed from its parent
     */
    leaveNode(node: TwingBaseNode): TwingBaseNode | null;
}

/**
 * Convenient factory for TwingNodeVisitor
 */
export const createNodeVisitor = (
    enterNode: (node: TwingBaseNode) => TwingNode,
    leaveNode: (node: TwingBaseNode) => TwingNode | null
): TwingNodeVisitor => {
    return {
        enterNode,
        leaveNode
    };
};
