import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingSpacelessNode} from "../node/spaceless";

export const executeSpacelessNode: TwingNodeExecutor<TwingSpacelessNode> = (node, executionContext) => {
    const {outputBuffer} = executionContext;
    const {nodeExecutor: execute} = executionContext;

    outputBuffer.start();

    return execute(node.children.body, executionContext)
        .then(() => {
            const content = outputBuffer.getAndClean().replace(/>\s+</g, '><').trim();

            outputBuffer.echo(content);
        });
};

export const executeSpacelessNodeSynchronously: TwingSynchronousNodeExecutor<TwingSpacelessNode> = (node, executionContext) => {
    const {outputBuffer} = executionContext;
    const {nodeExecutor: execute} = executionContext;

    outputBuffer.start();

    execute(node.children.body, executionContext);
    
    const content = outputBuffer.getAndClean().replace(/>\s+</g, '><').trim();

    outputBuffer.echo(content);
};
