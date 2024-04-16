import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode} from "./expression";

export type TwingBaseIncludeNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type TwingBaseIncludeNodeChildren = {
    variables: TwingBaseExpressionNode;
};

export interface TwingBaseIncludeNode<
    Type extends string,
    Attributes extends TwingBaseIncludeNodeAttributes = TwingBaseIncludeNodeAttributes,
    Children extends TwingBaseIncludeNodeChildren = TwingBaseIncludeNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
}

export const createBaseIncludeNode = <Type extends string, Attributes extends TwingBaseIncludeNodeAttributes, Children extends TwingBaseIncludeNodeChildren = TwingBaseIncludeNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    line: number,
    column: number,
    tag: string
): TwingBaseIncludeNode<Type, Attributes, Children> => {
    return createBaseNode(type, attributes, children, line, column, tag);
};
