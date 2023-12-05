import {createBaseNode, TwingBaseNode, TwingBaseNodeAttributes} from "../node";
import {getTraceableMethod} from "../helpers/traceable-method";

export type TwingBlockReferenceNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingBlockReferenceNode extends TwingBaseNode<"block_reference", TwingBlockReferenceNodeAttributes, {}> {
}

export const createBlockReferenceNode = (
    name: string,
    line: number,
    column: number,
    tag: string
): TwingBlockReferenceNode => {
    const outputNode = createBaseNode("block_reference", {
        name
    }, {}, line, column, tag);

    const blockReferenceNode: TwingBlockReferenceNode = {
        ...outputNode,
        execute: (executionContext) => {
            const {template, context, outputBuffer, blocks, sandboxed, sourceMapRuntime} = executionContext;
            const {name} = blockReferenceNode.attributes;

            const renderBlock = getTraceableMethod(template.renderBlock, blockReferenceNode.line, blockReferenceNode.column, template.name);

            return renderBlock(
                name,
                context.clone(),
                outputBuffer,
                blocks,
                true,
                sandboxed,
                sourceMapRuntime
            ).then(outputBuffer.echo);
        }
    };

    return blockReferenceNode;
};
