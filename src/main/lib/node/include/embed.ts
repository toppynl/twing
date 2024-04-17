import {
    TwingBaseIncludeNode,
    TwingBaseIncludeNodeAttributes,
    TwingBaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";

export type TwingEmbedNodeAttributes = TwingBaseIncludeNodeAttributes & {
    index: number;
};

export interface TwingEmbedNode extends TwingBaseIncludeNode<"embed", TwingEmbedNodeAttributes> {
}

export const createEmbedNode = (
    attributes: TwingEmbedNodeAttributes,
    children: Omit<TwingBaseIncludeNodeChildren, "expression">,
    line: number,
    column: number,
    tag: string
): TwingEmbedNode => {
    return createBaseIncludeNode(
        "embed",
        attributes,
        children,
        line,
        column,
        tag
    );
};
