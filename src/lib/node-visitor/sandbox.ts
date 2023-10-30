import {TwingBaseNodeVisitor} from "../base-node-visitor";
import {TwingEnvironment} from "../environment";
import {createBaseNode, getChildren, Node} from "../node";
import {createCheckSecurityNode} from "../node/check-security";
import {createCheckToStringNode} from "../node/check-to-string";
import {ArgumentsNode} from "../node/expression/arguments";

export class TwingNodeVisitorSandbox extends TwingBaseNodeVisitor {
    private tags: Map<string, Node>;
    private filters: Map<string, Node>;
    private functions: Map<string, Node>;
    private needsToStringWrap: boolean;

    constructor() {
        super();

        this.TwingNodeVisitorInterfaceImpl = this;
    }

    protected doEnterNode(node: Node, env: TwingEnvironment): Node {
        if (!env.isSandboxed()) {
            return node;
        }

        if (node.is("module")) {
            this.tags = new Map();
            this.filters = new Map();
            this.functions = new Map();

            return node;
        } else {
            // look for tags
            if (node.getNodeTag() && !(this.tags.has(node.getNodeTag()))) {
                this.tags.set(node.getNodeTag(), node as any); // todo
            }

            // look for filters
            if (node.is("call") && node.attributes.type === "filter") {
                const {operatorName} = node.attributes;

                if (!this.filters.has(operatorName)) {
                    this.filters.set(operatorName, node);
                }
            }

            // look for functions
            if (node.is("call") && node.attributes.type === "function") {
                const {operatorName} = node.attributes;

                if (!this.functions.has(operatorName)) {
                    this.functions.set(operatorName, node);
                }
            }

            // the .. operator is equivalent to the range() function
            if (node.is("range") && !(this.functions.has('range'))) {
                this.functions.set('range', node as any); // todo
            }

            // wrap print to check toString() calls
            if (node.is("print")) {
                this.needsToStringWrap = true;
                this.wrapNode(node, 'expr');
            }

            if (node.type === "set" && !node.attributes.capture) {
                this.needsToStringWrap = true;
            }

            // wrap outer nodes that can implicitly call toString()
            if (this.needsToStringWrap) {
                if (node.is("concat")) {
                    this.wrapNode(node, "left");
                    this.wrapNode(node, "right");
                }

                if (node.is("call") && node.attributes.type === "filter") {
                    this.wrapNode(node, "operand");
                    this.wrapArrayNode(node, "arguments");
                }

                if (node.is("call") && node.attributes.type === "function") {
                    this.wrapArrayNode(node, "arguments");
                }
            }
        }

        return node;
    }

    protected doLeaveNode(node: Node, env: TwingEnvironment): Node {
        if (!env.isSandboxed()) {
            return node;
        }

        if (node.is("module")) {
            if (!node.children.factory_end) {
                node.children.factory_end = createBaseNode(null);
            }

            node.children.factory_end.children['_security_check'] = createCheckSecurityNode(this.filters, this.tags, this.functions, node.line, node.column);
        } else {
            if (node.is("print") || node.is("set")) {
                this.needsToStringWrap = false;
            }
        }

        return node;
    }
    
    private wrapNode<T extends Node>(node: T, name: keyof T["children"]) {
        const expr: Node = node.children[name as any];
        
        if (expr.is("name") || expr.is("get_attribute")) {
            node.children[name as any] = createCheckToStringNode(expr, node.line, node.column);
        }
    }
    
    private wrapArrayNode<T extends Node>(node: T, name: keyof T["children"]) {
        const args: ArgumentsNode = node.children[name as any];

        for (const [name] of getChildren(args)) {
            this.wrapNode(args, name);
        }
    }

    getPriority(): number {
        return 0;
    }
}
