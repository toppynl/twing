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
    }, {}, (compiler) => {
        compiler
            .write(`await template.getTraceableRenderBlock(${line}, template.source)('${name}', context.clone(), outputBuffer, blocks, true, sourceMapRuntime)`)
        ;
    }, line, column, tag);

    return {
        ...outputNode,
        compile: (compiler) => {
            outputNode.compile(compiler);

            compiler.write(';\n');
        }
    }
};
