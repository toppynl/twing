import {TwingBaseExpressionNode} from "../expression";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const printNodeType = "print";

export interface TwingPrintNode extends TwingBaseOutputNode<typeof printNodeType, {}, {
    expr: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    const outputNode: TwingPrintNode = createBaseOutputNode(printNodeType, {}, {
        expr: expression
    }, line, column, null);

    const printNode: TwingPrintNode = {
        ...outputNode,
        execute: (...args) => {
            const [template, , outputBuffer, , , sourceMapRuntime] = args;

            sourceMapRuntime?.enterSourceMapBlock(printNode.line, printNode.column, printNode.type, template.source, outputBuffer);
            
            return printNode.children.expr.execute(...args)
                .then((result) => {
                    outputBuffer.echo(result);

                    sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
                });
        }
    };

    return printNode;
};

