import {createBaseNode, TwingBaseNode, TwingBaseNodeAttributes} from "../node";

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
    return createBaseNode("block_reference", {
        name
    }, {}, line, column, tag);
};
