import {TwingBaseNode} from "../node";
import {createPrintNode, TwingPrintNode} from "../node/output/print";
import {createDoNode} from "../node/do";
import {TwingConditionalNode, createConditionalNode, conditionalNodeType} from "../node/expression/conditional";
import {createEscapeNode, TwingEscapeNode} from "../node/expression/escape";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";
import {autoEscapeNodeType} from "../node/auto-escape";
import {blockFunctionNodeType} from "../node/expression/block-function";
import {methodCallNodeType} from "../node/expression/method-call";
import {parentFunctionNodeType} from "../node/expression/parent-function";
import {templateNodeType} from "../node/template";

export const createEscaperNodeVisitor = (): TwingNodeVisitor => {
    const safes: Map<TwingBaseNode, boolean> = new Map();
    const statusStack: Array<string | false> = [];

    let blocks: Map<string, string | false> = new Map();

    const analyze = (node: TwingBaseNode): boolean => {
        let isSafe = safes.get(node);
        
        if (isSafe === undefined) {
            if (node.is("constant")) {
                // constants are safe by definition
                isSafe = true;
            } else if (node.is(blockFunctionNodeType)) {
                // blocks function is safe by definition
                isSafe = true;
            } else if (node.is(parentFunctionNodeType)) {
                // parent function is safe by definition
                isSafe = true;
            } else if (node.is(conditionalNodeType)) {
                // intersect safeness of both operands
                const {expr2, expr3} = node.children;

                isSafe = intersectSafe(analyze(expr2), analyze(expr3));
            } else {
                isSafe = node.is(methodCallNodeType);
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

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        if (node.is(templateNodeType)) {
            blocks = new Map();
        } else if (node.is("auto_escape")) {
            const {strategy} = node.attributes;

            statusStack.push(strategy);
        } else if (node.is("block")) {
            const blockStatus = blocks.get(node.attributes.name);

            statusStack.push(blockStatus !== undefined ? blockStatus : needEscaping());
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (node.is(templateNodeType)) {
            blocks = new Map();
        } else if (node.is("print")) {
            const type = needEscaping();
            
            if (type !== false) {
                const {expression} = node.children;

                if (expression.is("conditional") && shouldUnwrapConditional(expression)) {
                    return createDoNode(unwrapConditional(expression, type), expression.line, expression.column, null);
                }
                
                return escapePrintNode(node, type);
            }
        }

        if (node.is("auto_escape") || node.is("block")) {
            statusStack.pop();
            
            if (node.is(autoEscapeNodeType)) {
                return node.children.body;
            }
        } else if (node.is("block_reference")) {
            blocks.set(node.attributes.name, needEscaping());
        }

        return node;
    };

    const shouldUnwrapConditional = (expression: TwingConditionalNode) => {
        const {expr2, expr3} = expression.children;

        const expr2IsSafe = isSafe(expr2);
        const expr3IsSafe = isSafe(expr3);

        return expr2IsSafe !== expr3IsSafe;
    };

    const unwrapConditional = (expression: TwingConditionalNode, type: string): TwingConditionalNode => {
        // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
        let {expr1, expr2, expr3} = expression.children;

        const wrapPrintNodeExpression = (node: TwingPrintNode): TwingPrintNode => {
            const {expression} = node.children;

            if (isSafe(expression)) {
                return node;
            }

            return createPrintNode(getEscapeNode(type, expression), node.line, node.column);
        };

        if (expr2.is("conditional") && shouldUnwrapConditional(expr2)) {
            expr2 = unwrapConditional(expr2, type);
        } else {
            expr2 = wrapPrintNodeExpression(createPrintNode(expr2, expr2.line, expr2.column));
        }

        if (expr3.is("conditional") && shouldUnwrapConditional(expr3)) {
            expr3 = unwrapConditional(expr3, type);
        } else {
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
