import type {BaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";
import type {BaseNodeAttributes} from "../../node";

export interface ArgumentsNode<T extends BaseExpressionNode = BaseExpressionNode> extends BaseExpressionNode<"arguments", BaseNodeAttributes, Record<string, T>> {
}

export const createArgumentsNode = <T extends BaseExpressionNode>(
    children: Record<string, T>,
    line: number,
    column: number
): ArgumentsNode<T> => {
    const baseNode = createBaseExpressionNode("arguments", {}, children, line, column);

    const node: ArgumentsNode<T> = {
        ...baseNode
    };

    return node;
};
