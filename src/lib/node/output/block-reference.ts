import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const blockReferenceType = "block_reference";

export type BlockReferenceNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingBlockReferenceNode extends TwingBaseOutputNode<typeof blockReferenceType, BlockReferenceNodeAttributes, {}> {
}

export const createBlockReferenceNode = (
    name: string,
    line: number,
    column: number,
    tag: string
): TwingBlockReferenceNode => {
    const outputNode = createBaseOutputNode(blockReferenceType, {
        name
    }, {}, line, column, tag);

    const node: TwingBlockReferenceNode = {
        ...outputNode,
        execute: (executionContext) => {
            const {template, context, outputBuffer, blocks, sandboxed, sourceMapRuntime} = executionContext;
            const {name} = node.attributes;

            const renderBlock = getTraceableMethod(template.renderBlock, node.line, node.column, template.name);

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

    return node;
};
