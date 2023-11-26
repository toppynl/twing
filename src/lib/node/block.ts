import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export const blockNodeType = "block";

export type TwingBlockNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingBlockNode extends TwingBaseNode<typeof blockNodeType, TwingBlockNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createBlockNode = (
    name: string,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string | null = null
): TwingBlockNode => {
    const baseNode = createBaseNode(blockNodeType, {name}, {body}, line, column, tag);

    const node: TwingBlockNode = {
        ...baseNode
    };

    return node;
};
