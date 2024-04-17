import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export interface TwingDeprecatedNode extends TwingBaseNode<"deprecated", TwingBaseNodeAttributes, {
    message: TwingBaseExpressionNode;
}> {
}

export const createDeprecatedNode = (
    message: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string
): TwingDeprecatedNode => {
    return createBaseNode("deprecated", {}, {
        message
    }, line, column, tag);
};
