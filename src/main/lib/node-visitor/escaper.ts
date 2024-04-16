import {TwingBaseNode, TwingNode} from "../node";
import {createPrintNode, TwingPrintNode} from "../node/print";
import {createDoNode} from "../node/do";
import {createConditionalNode, TwingConditionalNode} from "../node/expression/conditional";
import {createEscapeNode, TwingEscapeNode} from "../node/expression/escape";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";
import {TwingNullishCoalescingNode} from "../node/expression/nullish-coalescing";

export const createEscaperNodeVisitor = (): TwingNodeVisitor => {
    const safes: Map<TwingBaseNode, boolean> = new Map();
    const statusStack: Array<string | false> = [];

    let blocks: Map<string, string | false> = new Map();

    const analyze = (node: TwingBaseNode): boolean => {
        let isSafe = safes.get(node);

        if (isSafe === undefined) {
            if (node.type === "constant") {
                // constants are safe by definition
                isSafe = true;
            }
            else if (node.type === "block_function") {
                // blocks function is safe by definition
                isSafe = true;
            }
            else if (node.type === "parent_function") {
                // parent function is safe by definition
                isSafe = true;
            }
            else if (node.type === "conditional") {
                // intersect safeness of both operands
                const {expr2, expr3} = node.children;

                isSafe = intersectSafe(analyze(expr2), analyze(expr3));
            }
            else {
                isSafe = node.type === "method_call";
            }

            safes.set(node, isSafe);
        }

        return isSafe;
    };

    const intersectSafe = (a: boolean, b: boolean): boolean => {
        return a && b;
    };

    const needEscaping = (): string | false => {
        if (statusStack.length) {
            return statusStack[statusStack.length - 1];
        }

        return false;
    };

    const getEscapeNode = (type: string, node: TwingBaseNode): TwingEscapeNode => {
        return createEscapeNode(node, type);
    };

    const enterNode: TwingNodeVisitor["enterNode"] = (node: TwingNode) => {
        if (node.type === "template") {
            blocks = new Map();
        }
        else if (node.type === "auto_escape") {
            const {strategy} = node.attributes;

            statusStack.push(strategy);
        }
        else if (node.type === "block") {
            const blockStatus = blocks.get(node.attributes.name);

            statusStack.push(blockStatus !== undefined ? blockStatus : needEscaping());
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node: TwingNode) => {
        if (node.type === "template") {
            blocks = new Map();
        }
        else if (node.type === "print") {
            const type = needEscaping();

            if (type !== false) {
                const expression = node.children.expression as TwingNode;

                if ((expression.type === "conditional" || expression.type === "nullish_coalescing") && shouldUnwrapConditional(expression)) {
                    return createDoNode(unwrapConditional(expression, type), expression.line, expression.column, null);
                }

                return escapePrintNode(node, type);
            }
        }

        if (node.type === "auto_escape" || node.type === "block") {
            statusStack.pop();

            if (node.type === "auto_escape") {
                return node.children.body;
            }
        }
        else if (node.type === "block_reference") {
            blocks.set(node.attributes.name, needEscaping());
        }

        return node;
    };

    const shouldUnwrapConditional = (expression: TwingConditionalNode | TwingNullishCoalescingNode) => {
        const {expr2, expr3} = expression.children;

        const expr2IsSafe = isSafe(expr2);
        const expr3IsSafe = isSafe(expr3);

        return expr2IsSafe !== expr3IsSafe;
    };

    const unwrapConditional = (expression: TwingConditionalNode | TwingNullishCoalescingNode, type: string): TwingConditionalNode => {
        // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
        let {children} = expression;

        let expr1 = children.expr1 as TwingNode;
        let expr2 = children.expr2 as TwingNode;
        let expr3 = children.expr3 as TwingNode;

        const wrapPrintNodeExpression = (node: TwingPrintNode): TwingPrintNode => {
            const {expression} = node.children;

            if (isSafe(expression)) {
                return node;
            }

            return createPrintNode(getEscapeNode(type, expression), node.line, node.column);
        };

        if (expr2.type === "conditional" && shouldUnwrapConditional(expr2)) {
            expr2 = unwrapConditional(expr2, type);
        }
        else {
            expr2 = wrapPrintNodeExpression(createPrintNode(expr2, expr2.line, expr2.column));
        }

        if (expr3.type === "conditional" && shouldUnwrapConditional(expr3)) {
            expr3 = unwrapConditional(expr3, type);
        }
        else {
            expr3 = wrapPrintNodeExpression(createPrintNode(expr3, expr3.line, expr3.column));
        }

        return createConditionalNode(expr1, expr2, expr3, expression.line, expression.column);
    };

    const escapePrintNode = (node: TwingPrintNode, type: string) => {
        const {expression} = node.children;

        if (isSafe(expression)) {
            return node;
        }

        return createPrintNode(getEscapeNode(type, expression), node.line, node.column);
    };

    const isSafe = (expression: TwingBaseNode): boolean => {
        let safe = safes.get(expression);

        if (safe === undefined) {
            safe = analyze(expression);
        }

        return safe;
    }

    return createNodeVisitor(
        enterNode,
        leaveNode
    );
};
