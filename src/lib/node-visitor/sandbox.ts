import {TwingBaseNode, getChildren} from "../node";
import {createCheckSecurityNode} from "../node/check-security";
import {createCheckToStringNode} from "../node/check-to-string";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";
import {ArgumentsNode} from "../node/expression/arguments";
import {functionNodeType} from "../node/expression/call/function";
import {filterNodeType} from "../node/expression/call/filter";

export const createSandboxNodeVisitor = (): TwingNodeVisitor => {
    let tags: Map<string, TwingBaseNode>;
    let filters: Map<string, TwingBaseNode>;
    let functions: Map<string, TwingBaseNode>;

    let shouldWrap: boolean = true;

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        if (node.is("module")) {
            tags = new Map();
            filters = new Map();
            functions = new Map();

            return node;
        } else {
            // look for tags
            const {tag} = node;

            if (tag && !(tags.has(tag))) {
                tags.set(tag, node);
            }

            // look for filters
            if (node.is(filterNodeType)) {
                const {operatorName} = node.attributes;

                if (!filters.has(operatorName)) {
                    filters.set(operatorName, node);
                }
            }

            // look for functions
            if (node.is(functionNodeType)) {
                const {operatorName} = node.attributes;

                if (!functions.has(operatorName)) {
                    functions.set(operatorName, node);
                }
            }

            // the .. operator is equivalent to the range() function
            if (node.is("range") && !(functions.has('range'))) {
                functions.set('range', node);
            }

            if (node.is("print")) {
                shouldWrap = true;
                wrapNode(node, "expr");
            }

            if (node.is("set")) {
                shouldWrap = true;
            }

            if (shouldWrap) {
                if (node.is("concat")) {
                    wrapNode(node, "left");
                    wrapNode(node, "right");
                }

                if (node.is(filterNodeType)) {
                    wrapNode(node, "operand");
                    wrapArrayNode(node, "arguments");
                }

                if (node.is(functionNodeType)) {
                    wrapArrayNode(node, "arguments");
                }

                if (node.is("escape")) {
                    wrapNode(node, "body");
                }
            }
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (node.is("module")) {
            node.children.securityCheck = createCheckSecurityNode(filters, tags, functions, node.line, node.column);
        } else if (node.is("print") || node.is("set")) {
            shouldWrap = false;
        }

        return node;
    };

    const wrapNode = <T extends TwingBaseNode>(node: T, name: keyof T["children"]) => {
        const expression: TwingBaseNode = node.children[name as any];
        
        if (expression.is("name") || expression.is("get_attribute")) {
            node.children[name as any] = createCheckToStringNode(expression, expression.line, expression.column);
        }
    };

    const wrapArrayNode = <T extends TwingBaseNode>(node: T, name: keyof T["children"]) => {
        const args: ArgumentsNode = node.children[name as any];

        for (const [name] of getChildren(args)) {
            wrapNode(args, name);
        }
    };

    return createNodeVisitor(
        enterNode,
        leaveNode,
        0
    );
};
