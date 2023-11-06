import type {BaseNode} from "./node";
import {Node} from "./node";

/**
 * The interface that all node visitors must implement.
 */
export interface TwingNodeVisitor {
    /**
     * Called before the passed node is visited.
     *
     * @return {BaseNode} The modified node
     */
    enterNode(node: BaseNode): BaseNode;

    /**
     * Called after the passed node has been visited.
     *
     * @return {BaseNode} The modified node or null if the node must be removed from its parent
     */
    leaveNode(node: BaseNode): BaseNode | null;

    /**
     * Returns the priority for this visitor.
     *
     * Priority should be between -10 and 10 (0 is the default).
     *
     * @return int The priority level
     */
    readonly priority: number;
}

/**
 * Convenient factory for TwingNodeVisitor
 */
export const createNodeVisitor = (
    enterNode: (node: BaseNode) => Node,
    leaveNode: (node: BaseNode) => Node | null,
    priority: number
): TwingNodeVisitor => {
    return {
        enterNode,
        leaveNode,
        get priority() {
            return priority;
        }
    };
};
