import type {BaseExpressionNode, ExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";
import type {BaseNodeAttributes} from "../../node";

export interface ArgumentsNode extends BaseExpressionNode<"arguments", BaseNodeAttributes, Record<string, ExpressionNode>> {
}

export const createArgumentsNode = (
    children: Record<string, ExpressionNode>,
    line: number,
    column: number
): ArgumentsNode => {
    const baseNode = createBaseExpressionNode("arguments", {}, children, line, column);

    const node = {
        ...baseNode
    };

    return node;
};
