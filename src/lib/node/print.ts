import {TwingBaseExpressionNode} from "./expression";
import {createBaseNode, TwingBaseNode} from "../node";

export interface TwingPrintNode extends TwingBaseNode<"print", {}, {
    expression: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    const outputNode: TwingPrintNode = createBaseNode("print", {}, {
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

