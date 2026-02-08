import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingCommentNodeAttributes = TwingBaseNodeAttributes & {
    data: string;
};

export interface TwingCommentNode extends TwingBaseNode<"comment", TwingCommentNodeAttributes> {
}

export const createCommentNode = (
    data: string,
    line: number,
    column: number
): TwingCommentNode => {
    return createBaseNode("comment", {
        data
    }, {}, line, column);
};
