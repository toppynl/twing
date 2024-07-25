import type {TwingNodeExecutor} from "../node-executor";
import type {TwingPrintNode} from "../node/print";

export const executePrintNode: TwingNodeExecutor<TwingPrintNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute, outputBuffer, sourceMapRuntime} = executionContext;

    sourceMapRuntime?.enterSourceMapBlock(node.line, node.column, node.type, template.source, outputBuffer);

    return execute(node.children.expression, executionContext)
        .then((result) => {
            if (Array.isArray(result)) {
                result = 'Array';
            }

            outputBuffer.echo(result);

            sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
        });
};
