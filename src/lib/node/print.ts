import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";

export interface BasePrintNode<Type extends string> extends BaseNode<Type, BaseNodeAttributes, {
    expr: ExpressionNode;
}> {
}

export interface PrintNode extends BasePrintNode<"print"> {
}

const compile = <Type extends string>(
    node: BasePrintNode<Type>,
    compiler: Compiler
): void => {
    const {expr} = node.children;

    compiler
        .addSourceMapEnter(node)
        .write('outputBuffer.echo(')
        .subCompile(expr)
        .raw(');\n')
        .addSourceMapLeave()
    ;
}

export const createBasePrintNode = <Type extends string>(
    type: Type,
    expression: ExpressionNode,
    line: number,
    column: number,
    tag: string | null = null
): BasePrintNode<Type> => {
    const baseNode = createBaseNode(type, {}, {
        expr: expression
    }, line, column, tag);

    const printNode: BasePrintNode<Type> = {
        ...baseNode,
        compile: (compiler) => compile(printNode, compiler),
        isAnOutputNode: true
    };

    return printNode;
};

export const createPrintNode = (
    expression: ExpressionNode,
    line: number,
    column: number,
    tag: string | null = null
): PrintNode => createBasePrintNode("print", expression, line, column, tag);
