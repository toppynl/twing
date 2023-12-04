import type {TwingBaseNode} from "../node";
import {createBaseNode, TwingBaseNodeAttributes} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export type TwingWrapperNodeChildren<T extends TwingBaseExpressionNode> = Record<string, T>;

export interface TwingWrapperNode<T extends TwingBaseExpressionNode = TwingBaseExpressionNode> extends TwingBaseNode<"wrapper", TwingBaseNodeAttributes, TwingWrapperNodeChildren<T>> {

}

export const createWrapperNode = <T extends TwingBaseExpressionNode>(
    children: TwingWrapperNodeChildren<T>,
    line: number,
    column: number
): TwingWrapperNode<T> => {
    return createBaseNode("wrapper", {}, children, line, column);
};