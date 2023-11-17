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
    const node: TwingPrintNode = createBaseOutputNode(printNodeTYpe, {}, {
        expr: expression
    }, (compiler) => {
        const {expr} = node.children;

        compiler
            .subCompile(expr)
        ;
    }, line, column, null);

    return {
        ...node,
        compile: (compiler) => {
            compiler.addSourceMapEnter(node);
            
            node.compile(compiler);
            
            compiler
                .write(';\n')
                .addSourceMapLeave();
        }
    };
};

