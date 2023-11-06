import {TwingEnvironment} from "../environment";
import {BaseNode, createBaseNode, getChildren} from "../node";
import {createCheckSecurityNode} from "../node/check-security";
import {createCheckToStringNode} from "../node/check-to-string";
import {ArgumentsNode} from "../node/expression/arguments";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";

export const createSandboxNodeVisitor = (
    environment: TwingEnvironment
): TwingNodeVisitor => {
    let tags: Map<string, BaseNode>;
    let filters: Map<string, BaseNode>;
    let functions: Map<string, BaseNode>;
    let needsToStringWrap: boolean;

    const wrapNode = <T extends BaseNode>(node: T, name: keyof T["children"]) => {
        const expression: BaseNode = node.children[name as any];

        if (expression.is("name") || expression.is("get_attribute")) {
            node.children[name as any] = createCheckToStringNode(expression, node.line, node.column);
        }
    };

    const wrapArrayNode = <T extends BaseNode>(node: T, name: keyof T["children"]) => {
        const args: ArgumentsNode = node.children[name as any];

        for (const [name] of getChildren(args)) {
            wrapNode(args, name);
        }
    };

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        if (!environment.isSandboxed()) {
            return node;
        }

        if (node.is("module")) {
            tags = new Map();
            filters = new Map();
            functions = new Map();

            return node;
        } else {
            // look for tags
            const nodeTag = node.getNodeTag();
            
            if (nodeTag && !(tags.has(nodeTag))) {
                tags.set(nodeTag, node);
            }

            // look for filters
            if (node.is("call") && node.attributes.type === "filter") {
                const {operatorName} = node.attributes;

                if (!filters.has(operatorName)) {
                    filters.set(operatorName, node);
                }
            }

            // look for functions
            if (node.is("call") && node.attributes.type === "function") {
                const {operatorName} = node.attributes;

                if (!functions.has(operatorName)) {
                    functions.set(operatorName, node);
                }
            }

            // the .. operator is equivalent to the range() function
            if (node.is("range") && !(functions.has('range'))) {
                functions.set('range', node);
            }

            // wrap print to check toString() calls
            if (node.is("print")) {
                needsToStringWrap = true;
                wrapNode(node, "expr");
            }

            if (node.is("set") && !node.attributes.capture) {
                needsToStringWrap = true;
            }

            // wrap outer nodes that can implicitly call toString()
            if (needsToStringWrap) {
                if (node.is("concat")) {
                    wrapNode(node, "left");
                    wrapNode(node, "right");
                }

                if (node.is("call") && node.attributes.type === "filter") {
                    wrapNode(node, "operand");
                    wrapArrayNode(node, "arguments");
                }

                if (node.is("call") && node.attributes.type === "function") {
                    wrapArrayNode(node, "arguments");
                }
            }
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (!environment.isSandboxed()) {
            return node;
        }

        if (node.is("module")) {
            if (!node.children.factory_end) {
                node.children.factory_end = createBaseNode(null);
            }

            node.children.factory_end.children['_security_check'] = createCheckSecurityNode(filters, tags, functions, node.line, node.column);
        } else {
            if (node.is("print") || node.is("set")) {
                needsToStringWrap = false;
            }
        }

        return node;
    };

    return createNodeVisitor(
        enterNode,
        leaveNode,
        0
    );
};
