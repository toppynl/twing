import type {TwingNodeExecutor} from "../node-executor";
import type {TwingTextNode} from "../node/text";

export const executeTextNode: TwingNodeExecutor<TwingTextNode> = (textNode, executionContext) => {
    const {template, outputBuffer, sourceMapRuntime} = executionContext;

    sourceMapRuntime?.enterSourceMapBlock(textNode.line, textNode.column, textNode.type, template.source, outputBuffer);

    outputBuffer.echo(textNode.attributes.data);

    sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);

    return Promise.resolve();
};
