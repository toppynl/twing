import {
    TwingBaseIncludeNode,
    TwingBaseIncludeNodeAttributes,
    TwingBaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";
import {TwingBaseExpressionNode} from "../expression";

export type TwingIncludeNodeChildren = TwingBaseIncludeNodeChildren & {
    expression: TwingBaseExpressionNode;
};

export interface TwingIncludeNode extends TwingBaseIncludeNode<"include", TwingBaseIncludeNodeAttributes, TwingIncludeNodeChildren> {
}

export const createIncludeNode = (
    attributes: TwingBaseIncludeNodeAttributes,
    children: TwingIncludeNodeChildren,
    line: number,
    column: number,
    tag: string
): TwingIncludeNode => {
    return createBaseIncludeNode(
        "include",
        attributes,
        children,
        line,
        column,
        tag
    );
}
