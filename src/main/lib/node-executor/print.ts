import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
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

export const executePrintNodeSynchronously: TwingSynchronousNodeExecutor<TwingPrintNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute, outputBuffer, sourceMapRuntime} = executionContext;

    sourceMapRuntime?.enterSourceMapBlock(node.line, node.column, node.type, template.source, outputBuffer);

    let result = execute(node.children.expression, executionContext);
    
    if (Array.isArray(result)) {
        result = 'Array';
    }

    outputBuffer.echo(result);

    sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
};
