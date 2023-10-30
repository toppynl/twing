import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export type CommentNodeAttributes = BaseNodeAttributes & {
    data: string;
};

export interface CommentNode extends BaseNode<"comment", CommentNodeAttributes> {
}

export const createCommentNode = (
    data: string,
    line: number,
    column: number
): CommentNode => {
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
