import {TwingBaseExpressionNode} from "../expression";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const printNodeTYpe = "print";

export interface TwingPrintNode extends TwingBaseOutputNode<typeof printNodeTYpe, {}, {
    expr: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    const outputNode: TwingPrintNode = createBaseOutputNode(printNodeTYpe, {}, {
        expr: expression
    }, (compiler) => {
        const {expr} = outputNode.children;

        compiler
            .subCompile(expr)
        ;
    }, line, column, null);

    const printNode: TwingPrintNode = {
        ...outputNode,
        compile: (compiler) => {
            compiler.addSourceMapEnter(printNode);

            outputNode.compile(compiler);

            compiler
                .write(';\n')
                .addSourceMapLeave()
            ;
        }
    };

    return printNode;
};

