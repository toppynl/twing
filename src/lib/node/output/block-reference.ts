import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

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
        execute: (...args) => {
            const [template, context, outputBuffer, blocks, , sourceMapRuntime] = args;
            const {name} = node.attributes;

            const renderBlock = template.getTraceableMethod(template.renderBlock, node.line, node.column, template.templateName);
            
            return renderBlock(name, context.clone(), outputBuffer, blocks, true, sourceMapRuntime)
                .then(outputBuffer.echo);
        }
    };

    return node;
};
