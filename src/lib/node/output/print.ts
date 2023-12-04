import {TwingBaseOutputNode, createBaseOutputNode} from "../output";
import {TwingBaseExpressionNode} from "../expression";

export interface TwingPrintNode extends TwingBaseOutputNode<"print", {}, {
    expression: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    const outputNode: TwingPrintNode = createBaseOutputNode("print", {}, {
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

