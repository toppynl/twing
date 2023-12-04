import {
    TwingBaseIncludeNode,
    BaseIncludeNodeAttributes,
    BaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";
import {TwingBaseExpressionNode} from "../expression";

export const includeNodeType = "include";

export type TwingIncludeNodeChildren = BaseIncludeNodeChildren & {
    expression: TwingBaseExpressionNode;
};

export interface TwingIncludeNode extends TwingBaseIncludeNode<typeof includeNodeType, BaseIncludeNodeAttributes, TwingIncludeNodeChildren> {
}

export const createIncludeNode = (
    attributes: BaseIncludeNodeAttributes,
    children: TwingIncludeNodeChildren,
    line: number,
    column: number,
    tag: string
): TwingIncludeNode => {
    const baseNode = createBaseIncludeNode(
        includeNodeType,
        attributes,
        children,
        children.expression.execute,
        line,
        column,
        tag
    );

    const node: TwingIncludeNode = {
        ...baseNode
    };

    return node;
}
