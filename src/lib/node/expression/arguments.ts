import type {TwingBaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";
import type {TwingBaseNodeAttributes} from "../../node";

export interface ArgumentsNode<T extends TwingBaseExpressionNode = TwingBaseExpressionNode> extends TwingBaseExpressionNode<"arguments", TwingBaseNodeAttributes, Record<string, T>> {
}

// todo: check if needed - probably array node can be used instead
export const createArgumentsNode = <T extends TwingBaseExpressionNode>(
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
