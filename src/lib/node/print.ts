import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {BaseExpressionNode} from "./expression";
import {TwingCompiler} from "../compiler";

export interface BasePrintNode<Type extends string> extends BaseNode<Type, BaseNodeAttributes, {
    expr: BaseExpressionNode;
}> {
}

export interface PrintNode extends BasePrintNode<"print"> {
}

const compile = <Type extends string>(
    node: BasePrintNode<Type>,
    compiler: TwingCompiler
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
    expression: BaseExpressionNode,
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
    expression: BaseExpressionNode,
    line: number,
    column: number
): PrintNode => createBasePrintNode("print", expression, line, column);
