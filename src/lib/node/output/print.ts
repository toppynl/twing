import {TwingBaseExpressionNode} from "../expression";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const printNodeType = "print";

export interface TwingPrintNode extends TwingBaseOutputNode<typeof printNodeType, {}, {
    expression: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    const outputNode: TwingPrintNode = createBaseOutputNode(printNodeType, {}, {
        expression: expression
    }, line, column, null);

    const printNode: TwingPrintNode = {
        ...outputNode,
        execute: (executionContext) => {
            const {template, outputBuffer, sourceMapRuntime} = executionContext;

            sourceMapRuntime?.enterSourceMapBlock(printNode.line, printNode.column, printNode.type, template.source, outputBuffer);

            return printNode.children.expression.execute(executionContext)
                .then((result) => {
                    if (Array.isArray(result)) {
                        result = 'Array';
                    }
                    
                    outputBuffer.echo(result);

                    sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
                });
        }
    };

    return printNode;
};

