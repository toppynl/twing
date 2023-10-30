import {TwingBaseNodeVisitor} from "../base-node-visitor";
import {Node} from "../node";
import {TwingEnvironment} from "../environment";

const objectHash = require('object-hash');

interface Bucket {
    key: any,
    value: Array<string>
}

export class TwingNodeVisitorSafeAnalysis extends TwingBaseNodeVisitor {
    private data: Map<string, Array<Bucket>> = new Map();
    private safeVars: Array<string> = [];

    constructor() {
        super();

        this.TwingNodeVisitorInterfaceImpl = this;
    }

    setSafeVars(safeVars: Array<string>) {
        this.safeVars = safeVars;
    }

    getSafe(node: Node): Array<Node | string | false> {
        let hash = objectHash(node);

        if (!this.data.has(hash)) {
            return;
        }

        let bucket = this.data.get(hash).find(function (bucket: Bucket) {
            if (bucket.key === node) {
                if (bucket.value.includes('html_attr')) {
                    bucket.value.push('html');
                }

                return true;
            }
        });

        return bucket ? bucket.value : null;
    }

    private setSafe(node: Node, safe: Array<string>) {
        let hash = objectHash(node);
        let bucket = null;

        if (this.data.has(hash)) {
            bucket = this.data.get(hash).find(function (bucket: Bucket) {
                if (bucket.key === node) {
                    bucket.value = safe;

                    return true;
                }
            });
        }

        if (!bucket) {
            if (!this.data.has(hash)) {
                this.data.set(hash, []);
            }

            this.data.get(hash).push({
                key: node,
                value: safe
            });
        }
    }

    protected doEnterNode(node: Node, _env: TwingEnvironment): Node {
        return node;
    }

    protected doLeaveNode(node: Node, env: TwingEnvironment): Node {
        if (node.type === "expression_constant") {
            // constants are marked safe for all
            this.setSafe(node, ['all']);
        } else if (node.is('block_reference')) {
            // blocks are safe by definition
            this.setSafe(node, ['all']);
        } else if (node.is("parent")) {
            // parent block is safe by definition
            this.setSafe(node, ['all']);
        } else if (node.type === "conditional") {
            // intersect safeness of both operands
            const {expr2, expr3} = node.children;

            let safe = this.intersectSafe(this.getSafe(expr2), this.getSafe(expr3));
            this.setSafe(node, safe);
        } else if (node.type === "call" && node.attributes.type === "filter") {
            // filter expression is safe when the filter is safe
            const {arguments: filterArgs, operand} = node.children;
            const {operatorName} = node.attributes;

            let name = operatorName;
            let filter = env.getFilter(name);

            if (filter) {
                let safe = filter.getSafe(filterArgs);

                if (safe.length < 1) {
                    safe = this.intersectSafe(this.getSafe(operand), filter.getPreservesSafety());
                }

                this.setSafe(node, safe);
            } else {
                this.setSafe(node, []);
            }
        } else if (node.type === "call" && node.attributes.type === "function") {
            // function expression is safe when the function is safe
            const {arguments: functionArgs} = node.children;
            const {operatorName} = node.attributes;

            let name = operatorName;
            let functionNode = env.getFunction(name);

            if (functionNode) {
                this.setSafe(node, functionNode.getSafe(functionArgs as any));
            } else {
                this.setSafe(node, []);
            }
        } else if (node.type === "method_call") {
            if (node.attributes.safe) {
                this.setSafe(node, ['all']);
            } else {
                this.setSafe(node, []);
            }
        } else if (node.is("get_attribute") && node.children.target.is("name")) {
            let name = node.children.target.attributes.name;

            if (this.safeVars.includes(name)) {
                this.setSafe(node, ['all']);
            } else {
                this.setSafe(node, []);
            }
        } else {
            this.setSafe(node, []);
        }

        return node;
    }

    private intersectSafe(a: Array<any>, b: Array<any>) {
        if (a === null || b === null) {
            return [];
        }

        if (a.includes('all')) {
            return b;
        }

        if (b.includes('all')) {
            return a;
        }

        // array_intersect
        return a.filter(function (n) {
            return b.includes(n);
        });
    }

    getPriority() {
        return 0;
    }
}
