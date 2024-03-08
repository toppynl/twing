import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingNodeType} from "../../node";
import type {TwingNegativeNode} from "./unary/negative";
import type {TwingNotNode} from "./unary/not";
import type {TwingPositiveNode} from "./unary/positive";

export type TwingUnaryNode =
    | TwingNegativeNode
    | TwingNotNode
    | TwingPositiveNode
    ;

export interface TwingBaseUnaryNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    operand: TwingBaseExpressionNode;
}> {
}

export const createUnaryNodeFactory = <InstanceType extends TwingBaseUnaryNode<any>>(
    type: TwingNodeType<InstanceType>
) => {
    const factory = (
        operand: TwingBaseExpressionNode,
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseUnaryNode(type, operand, line, column);

        return {
            ...baseNode
        } as InstanceType;
    };

    return factory;
};

export const createBaseUnaryNode = <Type extends string>(
    type: Type,
    operand: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingBaseUnaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        operand
    }, line, column);

    return {
        ...baseNode
    };
};
