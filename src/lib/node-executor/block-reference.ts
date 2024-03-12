import type {TwingNodeExecutor} from "../node-executor";
import type {TwingBlockReferenceNode} from "../node/block-reference";
import {getTraceableMethod} from "../helpers/traceable-method";

export const executeBlockReferenceNode: TwingNodeExecutor<TwingBlockReferenceNode> = (node, executionContext) => {
    const {
        template,
        context,
        environment,
        outputBuffer,
        blocks,
        nodeExecutor: execute,
        sandboxed,
        sourceMapRuntime
    } = executionContext;
    const {name} = node.attributes;

    const renderBlock = getTraceableMethod(template.renderBlock, node.line, node.column, template.name);

    return renderBlock(
        environment,
        name,
        context.clone(),
        outputBuffer,
        blocks,
        true,
        sandboxed,
        execute,
        sourceMapRuntime
    ).then(outputBuffer.echo);
};
