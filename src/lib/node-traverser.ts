/**
 * TwingNodeTraverser is a node traverser.
 *
 * It visits all nodes and their children and calls the given visitor for each.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {TwingEnvironment} from "./environment";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {getChildren, Node} from "./node";

import {ksort} from "./helpers/ksort";
import {push} from "./helpers/push";

export class TwingNodeTraverser {
    private visitors: Map<number, Map<string, TwingNodeVisitorInterface>> = new Map();

    /**
     *
     * @param {AnEnvironment} env
     * @param {Array<TwingNodeVisitorInterface>} visitors
     */
    constructor(
        private readonly env: TwingEnvironment,
        visitors: Array<TwingNodeVisitorInterface> = []
    ) {
        this.env = env;

        for (let visitor of visitors) {
            this.addVisitor(visitor);
        }
    }

    addVisitor(visitor: TwingNodeVisitorInterface) {
        if (!this.visitors.has(visitor.getPriority())) {
            this.visitors.set(visitor.getPriority(), new Map());
        }

        push(this.visitors.get(visitor.getPriority()), visitor);
    }

    /**
     * Traverses a node and calls the registered visitors.
     */
    traverse(node: Node): Node {
        let result: Node | false = node;

        ksort(this.visitors);

        for (const [, visitors] of this.visitors) {
            for (const [, visitor] of visitors) {
                result = this.traverseWithVisitor(visitor, node);
            }
        }

        return result;
    }

    traverseWithVisitor(visitor: TwingNodeVisitorInterface, node: Node): Node {
        node = visitor.enterNode(node, this.env);
        
        for (const [key, child] of getChildren(node)) {
            const newChild = this.traverseWithVisitor(visitor, child);

            if (newChild) {
                if (newChild !== child) {
                    node.children[key] = newChild;
                }
            }
            else {
                delete child.children[key];
            }
        }

        return visitor.leaveNode(node, this.env);
    }
}
