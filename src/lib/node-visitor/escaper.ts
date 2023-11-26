import {TwingBaseNode} from "../node";
import {filterNodeType, TwingFilterNode} from "../node/expression/call/filter";
import {createPrintNode, TwingPrintNode} from "../node/output/print";
import {createDoNode} from "../node/do";
import {TwingConditionalNode, createConditionalNode} from "../node/expression/conditional";
import {createInlinePrintNode, TwingInlinePrintNode} from "../node/output/inline-print";
import {createEscapeNode, TwingEscapeNode} from "../node/expression/escape";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";
import {TwingFilter} from "../filter";
import {TwingFunction} from "../function";
import {getFilter} from "../helpers/get-filter";
import {getFunction} from "../helpers/get-function";
import {functionNodeType} from "../node/expression/call/function";

export type SafeEntry = "all" | string | boolean;
export type Safe = Array<SafeEntry>;
type Type = SafeEntry;

export const createEscaperNodeVisitor = (
    filters: Map<string, TwingFilter>,
    functions: Map<string, TwingFunction>
): TwingNodeVisitor => {
    const safes: Map<TwingBaseNode, Safe> = new Map();
    const statusStack: Array<Type> = [];

    let blocks: Map<string, Type> = new Map();

    const analyze = (node: TwingBaseNode): Safe => {
        let safe = safes.get(node);

        if (safe === undefined) {
            if (node.is("constant")) {
                // constants are safe by definition
                safe = ['all'];
            } else if (node.is("block_reference_expression")) {
                // blocks are safe by definition
                safe = ['all'];
            } else if (node.is("parent")) {
                // parent block is safe by definition
                safe = ['all'];
            } else if (node.is("conditional")) {
                // intersect safeness of both operands
                const {expr2, expr3} = node.children;

                safe = intersectSafe(analyze(expr2), analyze(expr3));
            } else if (node.is(filterNodeType)) {
                // filter expression is safe when the filter is safe
                const {arguments: callArguments} = node.children;
                const {operatorName} = node.attributes;
                const {operand} = node.children;
                const filter = getFilter(filters, operatorName);

                if (filter) {
                    safe = filter.getSafe(callArguments);
                    
                    if (safe && (safe.length < 1)) {
                        safe = intersectSafe(analyze(operand!), filter.preservesSafety);
                    }
                } else {
                    safe = [];
                }
            } else if (node.is(functionNodeType)) {
                // function expression is safe when the function is safe
                const {operatorName} = node.attributes;
                const {arguments: callArguments} = node.children;
                const twingFunction = getFunction(functions, operatorName);

                if (twingFunction) {
                    safe = twingFunction.getSafe(callArguments);
                } else {
                    safe = [];
                }
            } else if (node.is("method_call")) {
                safe = ['all'];
            } else {
                safe = [];
            }

            safes.set(node, safe);
        }

        return safe;
    };

    const intersectSafe = (a: Safe, b: Safe): Safe => {
        if (a.includes('all')) {
            return b;
        }

        if (b.includes('all')) {
            return a;
        }
        
        return a.filter((safeEntry) => {
            return b.includes(safeEntry);
        });
    };

    const needEscaping = (): Type | true => {
        if (statusStack.length) {
            return statusStack[statusStack.length - 1];
        }

        return true;
    };

    const getEscapeNode = (type: string | true, node: TwingBaseNode): TwingEscapeNode => {
        const {line, column} = node;
        
        return createEscapeNode(node, type, line, column);
    };

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        if (node.is("module")) {
            blocks = new Map();
        } else if (node.is("auto_escape")) {
            const {strategy} = node.attributes;

            statusStack.push(strategy === true ? "html" : (strategy === null ? false : strategy));
        } else if (node.is("block")) {
            const blockStatus = blocks.get(node.attributes.name);

            statusStack.push(blockStatus !== undefined ? blockStatus : needEscaping());
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (node.type === "module") {
            blocks = new Map();
        } else if (node.is(filterNodeType)) {
            return preEscapeFilterNode(node);
        } else if (node.is("print")) {
            const type = needEscaping();
            
            if (type !== false) {
                const {expr: expression} = node.children;
                
                if (expression.is("conditional") && shouldUnwrapConditional(expression, type)) {
                    return createDoNode(unwrapConditional(expression, type), expression.line, expression.column, null);
                }

                return escapePrintNode(node, type);
            }
        }

        if (node.is("auto_escape") || node.is("block")) {
            statusStack.pop();
        } else if (node.is("block_reference")) {
            blocks.set(node.attributes.name, needEscaping());
        }

        return node;
    };

    const shouldUnwrapConditional = (expression: TwingConditionalNode, type: Type) => {
        const {expr2, expr3} = expression.children;
        
        const expr2IsSafe = isSafeFor(type, expr2);
        const expr3IsSafe = isSafeFor(type, expr3);
        
        return expr2IsSafe !== expr3IsSafe;
    };

    const unwrapConditional = (expression: TwingConditionalNode, type: string | true): TwingConditionalNode => {
        // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
        let {expr1, expr2, expr3} = expression.children;
        
        if (expr2.is("conditional") && shouldUnwrapConditional(expr2, type)) {
            expr2 = unwrapConditional(expr2, type);
        } else {
            expr2 = escapeInlinePrintNode(createInlinePrintNode(expr2, expr2.line, expr2.column), type);
        }

        if (expr3.is("conditional") && shouldUnwrapConditional(expr3, type)) {
            expr3 = unwrapConditional(expr3, type);
        } else {
            expr3 = escapeInlinePrintNode(createInlinePrintNode(expr3, expr3.line, expr3.column), type);
        }

        return createConditionalNode(expr1, expr2, expr3, expression.line, expression.column);
    };

    const escapeInlinePrintNode = (node: TwingInlinePrintNode, type: string | true): TwingInlinePrintNode => {
        const expression = node.children.node;

        if (isSafeFor(type, expression)) {
            return node;
        }

        return createInlinePrintNode(getEscapeNode(type, expression), node.line, node.column);
    };

    const escapePrintNode = (node: TwingPrintNode, type: string | true) => {
        const expression = node.children.expr;

        if (isSafeFor(type, expression)) {
            return node;
        }

        return createPrintNode(getEscapeNode(type, expression), node.line, node.column);
    };

    const preEscapeFilterNode = (filterNode: TwingFilterNode) => {
        const name = filterNode.attributes.operatorName;

        const filter = getFilter(filters, name);

        if (!filter) {
            return filterNode;
        }

        const type = filter.preEscape;

        if (type === null) {
            return filterNode;
        }

        const operand = filterNode.children.operand;

        if (isSafeFor(type, operand!)) {
            return filterNode;
        }

        filterNode.children.operand = getEscapeNode(type, operand!);

        return filterNode;
    };

    const isSafeFor = (type: Type, expression: TwingBaseNode): boolean => {
        let safe = safes.get(expression);

        if (safe === undefined) {
            safe = analyze(expression);
        }

        return safe.includes(type) || safe.includes('all');
    }

    return createNodeVisitor(
        enterNode,
        leaveNode
    );
};
