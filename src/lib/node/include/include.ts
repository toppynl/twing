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
    const baseNode = createBaseIncludeNode(
        "include",
        attributes,
        children,
        children.expression.execute,
        line,
        column,
        tag
    );

    const includeNode: TwingIncludeNode = {
        ...baseNode
    };

    return includeNode;
}
