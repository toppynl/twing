import {BaseNode} from "../node";
import {TwingEnvironment} from "../environment";
import {createSafeAnalysisNodeVisitor} from "./safe-analysis";
import {createNodeTraverser, TwingNodeTraverser} from "../node-traverser";
import {FilterNode} from "../node/expression/call/filter";
import {createPrintNode, PrintNode} from "../node/print";
import {createDoNode} from "../node/do";
import {ConditionalNode, createConditionalNode} from "../node/expression/conditional";
import {createInlinePrintNode, InlinePrintNode} from "../node/inline-print";
import {createAutoescapeFilterNode} from "../node/expression/call/filter/autoescape";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";

export const createEscaperNodeVisitor = (
    environment: TwingEnvironment
): TwingNodeVisitor => {
    const statusStack: Array<string | false> = [];
    const safeAnalysis = createSafeAnalysisNodeVisitor(environment);

    let blocks: Map<string, any> = new Map();
    let defaultStrategy: string | false = false;
    let safeVars: Array<string> = [];
    let traverse: TwingNodeTraverser | null = null;

    const needEscaping = (): string | false => {
        if (statusStack.length) {
            return statusStack[statusStack.length - 1];
        }

        return defaultStrategy ? defaultStrategy : false;
    };

    const getEscaperFilter = (type: string | false, node: BaseNode) => {
        const {line, column} = node;

        return createAutoescapeFilterNode(node, type, line, column);
    };

    const enterNode: TwingNodeVisitor["enterNode"] = (node) => {
        if (node.is("module")) {
            defaultStrategy = environment.getEscapingStrategy(node.attributes.templateName);
            safeVars = [];
            blocks = new Map();
        } else if (node.is("auto_escape")) {
            statusStack.push(node.attributes.strategy);
        } else if (node.is("block")) {
            statusStack.push(blocks.has(node.attributes.name) ? blocks.get(node.attributes.name) : needEscaping());
        } else if (node.is("import")) {
            safeVars.push(node.children.var.attributes.name);
        }

        return node;
    };

    const leaveNode: TwingNodeVisitor["leaveNode"] = (node) => {
        if (node.type === "module") {
            defaultStrategy = false;
            safeVars = [];
            blocks = new Map();
        } else if (node.is("call") && node.attributes.type === "filter") {
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

    const shouldUnwrapConditional = (expression: ConditionalNode, type: any) => {
        let expr2Safe = isSafeFor(type, expression.children.expr2);
        let expr3Safe = isSafeFor(type, expression.children.expr3);

        return expr2Safe !== expr3Safe;
    };

    const unwrapConditional = (expression: ConditionalNode, type: string | false): ConditionalNode => {
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

    const escapeInlinePrintNode = (node: InlinePrintNode, type: string | false): InlinePrintNode => {
        let expression = node.children.node;

        if (isSafeFor(type, expression)) {
            return node;
        }

        return createInlinePrintNode(getEscaperFilter(type, expression), node.line, node.column);
    };

    const escapePrintNode = (node: PrintNode, type: any) => {
        let expression = node.children.expr;

        if (isSafeFor(type, expression)) {
            return node;
        }

        return createPrintNode(getEscaperFilter(type, expression), node.line, node.column);
    };

    const preEscapeFilterNode = (filterNode: FilterNode) => {
        const name = filterNode.attributes.operatorName;

        const filter = environment.getFilter(name);

        if (!filter) {
            return filterNode;
        }

        const type = filter.preEscape;

        if (type === null) {
            return filterNode;
        }

        const {operand} = filterNode.children;

        if (operand) {
            if (isSafeFor(type, operand)) {
                return filterNode;
            }

            filterNode.children.operand = getEscaperFilter(type, operand);
        }

        return filterNode;
    };

    const isSafeFor = (type: BaseNode | string | false, expression: BaseNode): boolean => {
        let safe = safeAnalysis.getSafe(expression);

        if (!safe) {
            if (!traverse) {
                traverse = createNodeTraverser([safeAnalysis]);
            }

            safeAnalysis.safeVars = safeVars;

            traverse(expression);

            safe = safeAnalysis.getSafe(expression);
        }
        
        return (safe !== null) && (safe.includes(type) || safe.includes('all'));
    }

    return createNodeVisitor(
        enterNode,
        leaveNode,
        0
    );
};
