import {TwingBaseNode, getChildren, TwingNode} from "../node";
import {createCheckSecurityNode} from "../node/check-security";
import {createCheckToStringNode} from "../node/check-to-string";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";
import type {TwingWrapperNode} from "../node/wrapper";

export const createSandboxNodeVisitor = (): TwingNodeVisitor => {
    let tags: Map<string, TwingBaseNode>;
    let filters: Map<string, TwingBaseNode>;
    let functions: Map<string, TwingBaseNode>;

    let shouldWrap: boolean = true;

    const enterNode: TwingNodeVisitor["enterNode"] = (node: TwingNode) => {
        if (node.type === "template") {
            tags = new Map();
            filters = new Map();
            functions = new Map();

            return node;
        }
        else {
            // look for tags
            const {tag} = node;

            if (tag && !(tags.has(tag))) {
                tags.set(tag, node);
            }

            // look for filters
            if (node.type === "filter") {
                const {operatorName} = node.attributes;

                if (!filters.has(operatorName)) {
                    filters.set(operatorName, node);
                }
            }

            // look for functions
            if (node.type === "function") {
                const {operatorName} = node.attributes;

                if (!functions.has(operatorName)) {
                    functions.set(operatorName, node);
                }
            }

            // the .. operator is equivalent to the range() function
            if (node.type === "range" && !(functions.has('range'))) {
                functions.set('range', node);
            }

            if (node.type === "print") {
                shouldWrap = true;
                wrapNode(node, "expression");
            }

            if (node.type === "set") {
                shouldWrap = true;
            }

            if (shouldWrap) {
                if (node.type === "concatenate") {
                    wrapNode(node, "left");
                    wrapNode(node, "right");
                }

                if (node.type === "filter") {
                    wrapNode(node, "operand");
                    wrapArrayNode(node, "arguments");
                }

                if (node.type === "function") {
                    wrapArrayNode(node, "arguments");
                }

                if (node.type === "escape") {
                    wrapNode(node, "body");
                }
            }
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node: TwingNode) => {
        if (node.type === "template") {
            node.children.securityCheck = createCheckSecurityNode(filters, tags, functions, node.line, node.column);
        }
        else if (node.type === "print" || node.type === "set") {
            shouldWrap = false;
        }

        return node;
    };

    const wrapNode = <T extends TwingNode>(node: T, name: keyof T["children"]) => {
        const expression: TwingNode = (node.children as any)[name];

        if (expression.type === "name" || expression.type === "attribute_accessor") {
            (node.children as any)[name] = createCheckToStringNode(expression, expression.line, expression.column);
        }
    };

    const wrapArrayNode = <T extends TwingNode>(node: T, name: keyof T["children"]) => {
        const args: TwingWrapperNode = (node.children as any)[name]; // todo: check with TS team with we have to cast children as any

        for (const [name] of getChildren(args)) {
            wrapNode(args, name);
        }
    };

    return createNodeVisitor(
        enterNode,
        leaveNode
    );
};
