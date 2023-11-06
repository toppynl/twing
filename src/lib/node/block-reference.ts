import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export const blockReferenceType = "block_reference";

export type BlockReferenceNodeAttributes = BaseNodeAttributes & {
    name: string;
};

export interface BlockReferenceNode extends BaseNode<typeof blockReferenceType, BlockReferenceNodeAttributes> {
}

export const createBlockReferenceNode = (
    name: string,
    line: number,
    column: number,
    tag: string
): BlockReferenceNode => {
    const baseNode = createBaseNode(blockReferenceType, {
        name
    }, {}, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write(`outputBuffer.echo(await template.traceableRenderBlock(${baseNode.line}, template.source)('${baseNode.attributes.name}', context.clone(), outputBuffer, blocks));\n`)
            ;
        },
        isAnOutputNode: true
    }
};
