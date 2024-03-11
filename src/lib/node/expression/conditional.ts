import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {TwingBaseNode} from "../../node";

export interface TwingBaseConditionalNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    expr1: TwingBaseNode;
    expr2: TwingBaseNode;
    expr3: TwingBaseNode;
}> {
}

export interface TwingConditionalNode extends TwingBaseConditionalNode<"conditional"> {
}

export const createBaseConditionalNode = <Type extends string>(
    type: Type,
    expr1: TwingBaseNode,
    expr2: TwingBaseNode,
    expr3: TwingBaseNode,
    line: number,
    column: number
): TwingBaseConditionalNode<Type> => {
    return createBaseExpressionNode(type, {}, {
        expr1, expr2, expr3
    }, line, column);
};

export const createConditionalNode = (
    expr1: TwingBaseNode,
    expr2: TwingBaseNode,
    expr3: TwingBaseNode,
    line: number,
    column: number
) => createBaseConditionalNode("conditional", expr1, expr2, expr3, line, column);
