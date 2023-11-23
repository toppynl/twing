import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";

export const conditionalNodeType = "conditional";

export interface TwingBaseConditionalNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    expr1: TwingBaseNode;
    expr2: TwingBaseNode;
    expr3: TwingBaseNode;
}> {
}

export interface TwingConditionalNode extends TwingBaseConditionalNode<typeof conditionalNodeType> {
}

export const createBaseConditionalNode = <Type extends string>(
    type: Type,
    expr1: TwingBaseNode,
    expr2: TwingBaseNode,
    expr3: TwingBaseNode,
    line: number,
    column: number
): TwingBaseConditionalNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        expr1, expr2, expr3
    }, line, column);

    return {
        ...baseNode,
        execute: async (...args) => {
            const {expr1, expr2, expr3} = baseNode.children;

            return (await expr1.execute(...args)) ? expr2.execute(...args) : expr3.execute(...args);
        }
    };
};

export const createConditionalNode = (
    expr1: TwingBaseNode,
    expr2: TwingBaseNode,
    expr3: TwingBaseNode,
    line: number,
    column: number
) => createBaseConditionalNode(conditionalNodeType, expr1, expr2, expr3, line, column);
