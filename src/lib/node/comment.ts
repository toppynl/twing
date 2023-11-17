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
    const baseNode = createBaseNode("comment", {
        data
    }, {}, line, column);

    return {
        ...baseNode,
        compile: () => {
            // noop
        }
    }
};
