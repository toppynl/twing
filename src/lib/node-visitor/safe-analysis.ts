import {Node} from "../node";
import {TwingEnvironment} from "../environment";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";

const objectHash = require('object-hash');

interface Bucket {
    key: any;
    value: Safe;
}

export type Safe = Array<Node | string | false>;

export interface SafeAnalysisNodeVisitor extends TwingNodeVisitor {
    getSafe(node: Node): Safe | null;

    safeVars: Array<string>;
}

export const createSafeAnalysisNodeVisitor = (
    environment: TwingEnvironment
): SafeAnalysisNodeVisitor => {
    const data: Map<string, Array<Bucket>> = new Map();

    let safeVars: SafeAnalysisNodeVisitor["safeVars"] = [];

    const getSafe: SafeAnalysisNodeVisitor["getSafe"] = (node) => {
        const hash = objectHash(node);

        const buckets = data.get(hash);

        if (buckets === undefined) {
            return null;
        }

        let bucket = buckets.find((bucket) => {
            if (bucket.key === node) {
                if (bucket.value.includes('html_attr')) {
                    bucket.value.push('html');
                }

                return true;
            }
        });

        return bucket ? bucket.value : null;
    }

    const setSafe = (node: Node, safe: Safe) => {
        let hash = objectHash(node);
        let bucket = null;

        let buckets = data.get(hash);

        if (buckets !== undefined) {
            bucket = buckets.find((bucket) => {
                if (bucket.key === node) {
                    bucket.value = safe;

                    return true;
                }
            });
        }

        if (!bucket) {
            if (buckets === undefined) {
                buckets = [];

                data.set(hash, buckets);
            }

            buckets.push({
                key: node,
                value: safe
            });
        }
    }

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (node.is("constant")) {
            // constants are marked safe for all
            setSafe(node, ['all']);
        } else if (node.is('block_reference')) {
            // blocks are safe by definition
            setSafe(node, ['all']);
        } else if (node.is("parent")) {
            // parent block is safe by definition
            setSafe(node, ['all']);
        } else if (node.is("conditional")) {
            // intersect safeness of both operands
            const {expr2, expr3} = node.children;
            const safe = intersectSafe(getSafe(expr2), getSafe(expr3));

            setSafe(node, safe);
        } else if (node.is("call")) {
            const {arguments: callArguments} = node.children;
            const {operatorName} = node.attributes;

            if (node.attributes.type === "filter") {
                // filter expression is safe when the filter is safe
                const {operand} = node.children;
                const filter = environment.getFilter(operatorName);

                if (filter) {
                    let safe = filter.getSafe(callArguments);

                    if (safe && (safe.length < 1)) {
                        safe = intersectSafe(getSafe(operand!), filter.preservesSafety);
                    }

                    setSafe(node, safe);
                } else {
                    setSafe(node, []);
                }
            } else if (node.attributes.type === "function") {
                // function expression is safe when the function is safe
                const functionNode = environment.getFunction(operatorName);

                if (functionNode) {
                    setSafe(node, functionNode.getSafe(callArguments));
                } else {
                    setSafe(node, []);
                }
            }
        } else if (node.is("method_call")) {
            if (node.attributes.safe) {
                setSafe(node, ['all']);
            } else {
                setSafe(node, []);
            }
        } else if (node.is("get_attribute") && node.children.target.is("name")) {
            let name = node.children.target.attributes.name;

            if (safeVars.includes(name)) {
                setSafe(node, ['all']);
            } else {
                setSafe(node, []);
            }
        } else {
            setSafe(node, []);
        }

        return node;
    };
    
    const intersectSafe = (a: Safe | null, b: Safe | null): Safe => {
        if (a === null || b === null) {
            return [];
        }

        if (a.includes('all')) {
            return b;
        }

        if (b.includes('all')) {
            return a;
        }
        
        return a.filter((n) => {
            return b.includes(n);
        });
    };

    return Object.assign(createNodeVisitor(
        enterNode,
        leaveNode,
        0
    ), {
        getSafe,
        safeVars
    });
};
