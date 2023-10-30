import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export interface BodyNode extends BaseNode<"body", BaseNodeAttributes, {
    content: BaseNode<any>;
}> {
}

export const createBodyNode = (
    content: BaseNode<any>,
    line: number,
    column: number,
    tag?: string
): BodyNode => createBaseNode("body", {}, {
    content
}, line, column, tag);
