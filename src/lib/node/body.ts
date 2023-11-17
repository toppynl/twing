import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export interface TwingBodyNode extends TwingBaseNode<"body", TwingBaseNodeAttributes, {
    content: TwingBaseNode;
}> {
}

export const createBodyNode = (
    content: TwingBaseNode,
    line: number,
    column: number,
    tag?: string
): TwingBodyNode => createBaseNode("body", {}, {
    content
}, line, column, tag);
