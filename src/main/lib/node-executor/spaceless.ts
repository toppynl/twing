import {TwingNodeExecutor} from "../node-executor";
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
