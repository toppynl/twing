import {TwingBaseNodeVisitor} from "../base-node-visitor";
import {Node} from "../node";
import {TwingEnvironment} from "../environment";
import {TwingNodeVisitorSafeAnalysis} from "./safe-analysis";
import {TwingNodeTraverser} from "../node-traverser";
import {createConstantNode} from "../node/expression/constant";
import {createFilterNode, FilterNode} from "../node/expression/call/filter";
import {createPrintNode, PrintNode} from "../node/print";
import {createDoNode} from "../node/do";
import {ConditionalNode, createConditionalNode} from "../node/expression/conditional";
import {createInlinePrintNode, InlinePrintNode} from "../node/inline-print";
import {createArgumentsNode} from "../node/expression/arguments";

export class TwingNodeVisitorEscaper extends TwingBaseNodeVisitor {
    private statusStack: Array<Node | string | false> = [];
    private blocks: Map<string, any> = new Map();
    private safeAnalysis: TwingNodeVisitorSafeAnalysis;
    private traverser: TwingNodeTraverser;
    private defaultStrategy: string | false = false;
    private safeVars: Array<string> = [];

    constructor() {
        super();

        this.TwingNodeVisitorInterfaceImpl = this;

        this.safeAnalysis = new TwingNodeVisitorSafeAnalysis();
    }

    protected doEnterNode(node: Node, env: TwingEnvironment): Node {
        if (node.is("module")) {
            this.defaultStrategy = env.getEscapingStrategy(node.attributes.templateName);
            this.safeVars = [];
            this.blocks = new Map();
        } else if (node.is("auto_escape")) {
            this.statusStack.push(node.attributes.strategy);
        } else if (node.is("block")) {
            this.statusStack.push(this.blocks.has(node.attributes.name) ? this.blocks.get(node.attributes.name) : this.needEscaping());
        } else if (node.is("import")) {
            this.safeVars.push(node.children.var.attributes.name);
        }

        return node;
    }

    protected doLeaveNode(node: Node, env: TwingEnvironment): Node {
        if (node.type === "module") {
            this.defaultStrategy = false;
            this.safeVars = [];
            this.blocks = new Map();
        } else if (node.type === "call" && node.attributes.type === "filter") {
            return this.preEscapeFilterNode(node, env);
        } else if (node.is("print")) {
            const type = this.needEscaping();
            
            if (type !== false) {
                const {expr: expression} = node.children;

                if (expression.is("conditional") && this.shouldUnwrapConditional(expression, env, type)) {
                    return createDoNode(this.unwrapConditional(expression, env, type), expression.line, expression.column);
                }

                return this.escapePrintNode(node, env, type);
            }
        }

        if (node.is("auto_escape") || node.is("block")) {
            this.statusStack.pop();
        } else if (node.is("block_reference")) {
            this.blocks.set(node.attributes.name, this.needEscaping());
        }

        return node;
    }

    private shouldUnwrapConditional(expression: ConditionalNode, env: TwingEnvironment, type: any) {
        let expr2Safe = this.isSafeFor(type, expression.children.expr2, env);
        let expr3Safe = this.isSafeFor(type, expression.children.expr3, env);

        return expr2Safe !== expr3Safe;
    }

    private unwrapConditional(expression: ConditionalNode, env: TwingEnvironment, type: any): ConditionalNode {
        // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
        let {expr1, expr2, expr3} = expression.children;

        if (expr2.is("conditional") && this.shouldUnwrapConditional(expr2, env, type)) {
            expr2 = this.unwrapConditional(expr2, env, type);
        } else {
            expr2 = this.escapeInlinePrintNode(createInlinePrintNode(expr2, expr2.line, expr2.column), env, type);
        }

        if (expr3.is("conditional") && this.shouldUnwrapConditional(expr3, env, type)) {
            expr3 = this.unwrapConditional(expr3, env, type);
        } else {
            expr3 = this.escapeInlinePrintNode(createInlinePrintNode(expr3, expr3.line, expr3.column), env, type);
        }

        return createConditionalNode(expr1, expr2, expr3, expression.line, expression.column);
    }

    private escapeInlinePrintNode(node: InlinePrintNode, env: TwingEnvironment, type: any): InlinePrintNode {
        let expression = node.children.node;

        if (this.isSafeFor(type, expression as any, env)) {
            return node as any; // todo
        }

        return createInlinePrintNode(this.getEscaperFilter(type, expression as any) as any, node.line, node.column) as any; // todo
    }

    private escapePrintNode(node: PrintNode, env: TwingEnvironment, type: any) {
        let expression = node.children.expr;

        if (this.isSafeFor(type, expression, env)) {
            return node;
        }

        return createPrintNode(this.getEscaperFilter(type, expression), node.line, node.column);
    }

    private preEscapeFilterNode(filterNode: FilterNode, env: TwingEnvironment) {
        let name = filterNode.attributes.operatorName;

        const filter = env.getFilter(name);

        if (!filter) {
            return filterNode;
        }

        let type = env.getFilter(name).getPreEscape();

        if (type === null) {
            return filterNode;
        }

        let node = filterNode.children.operand;

        if (this.isSafeFor(type, node, env)) {
            return filterNode;
        }

        filterNode.children.operand = this.getEscaperFilter(type, node);

        return filterNode;
    }

    private isSafeFor(type: Node | string | false, expression: Node, env: TwingEnvironment) {
        let safe = this.safeAnalysis.getSafe(expression);

        if (!safe) {
            if (!this.traverser) {
                this.traverser = new TwingNodeTraverser(env, [this.safeAnalysis]);
            }

            this.safeAnalysis.setSafeVars(this.safeVars);

            this.traverser.traverse(expression);

            safe = this.safeAnalysis.getSafe(expression);
        }

        return (safe.includes(type)) || (safe.includes('all'));
    }

    private needEscaping(): string | false | Node {
        if (this.statusStack.length) {
            return this.statusStack[this.statusStack.length - 1];
        }

        return this.defaultStrategy ? this.defaultStrategy : false;
    }

    private getEscaperFilter(type: string | false | Node, node: Node) {
        const {line, column} = node;

        const argumentsNode = createArgumentsNode({
            0: createConstantNode(type, line, column),
            1: createConstantNode(null, line, column),
            2: createConstantNode(true, line, column)
        }, line, column);

        return createFilterNode(node, 'escape', argumentsNode, line, column);
    }

    public getPriority() {
        return 0;
    }
}
