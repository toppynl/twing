import type {TwingNodeVisitorInterface} from "./node-visitor-interface";
import type {Node} from "./node";
import type {TwingEnvironment} from "./environment";

export abstract class TwingBaseNodeVisitor implements TwingNodeVisitorInterface {
    TwingNodeVisitorInterfaceImpl: TwingNodeVisitorInterface;

    constructor() {
        this.TwingNodeVisitorInterfaceImpl = this;
    }

    abstract getPriority(): number;

    /**
     * Called before child nodes are visited.
     *
     * @returns The modified node
     */
    enterNode(node: Node, env: TwingEnvironment): Node {
        return this.doEnterNode(node, env);
    }

    /**
     * Called after child nodes are visited.
     *
     * @returns The modified node or null if the node must be removed
     */
    leaveNode(node: Node, env: TwingEnvironment): Node | null {
        return this.doLeaveNode(node, env);
    }

    /**
     * Called before child nodes are visited.
     *
     * @returns The modified node
     */
    protected abstract doEnterNode(node: Node, env: TwingEnvironment): Node;

    /**
     * Called after child nodes are visited.
     *
     * @returns The modified node or null if the node must be removed
     */
    protected abstract doLeaveNode(node: Node, env: TwingEnvironment): Node | null;
}
