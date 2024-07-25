import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export interface TwingSpacelessNode extends TwingBaseNode<"spaceless", TwingBaseNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createSpacelessNode = (
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingSpacelessNode => {
    return createBaseNode("spaceless", {}, {
        body
    }, line, column, tag);
};
