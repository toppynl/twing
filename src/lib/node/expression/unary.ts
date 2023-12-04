import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingNodeType} from "../../node";
import type {TwingNegativeNode} from "./unary/negative";
import type {TwingNotNode} from "./unary/not";
import type {TwingPositiveNode} from "./unary/positive";
import type {TwingExecutionContext} from "../../execution-context";

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
    type: TwingNodeType<InstanceType>,
    definition: {
        execute: (
            operand: TwingBaseExpressionNode,
            executionContext: TwingExecutionContext
        ) => Promise<any>;
    }
) => {
    const factory = (
        operand: TwingBaseExpressionNode,
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseUnaryNode(type, operand, line, column);

        return {
            ...baseNode,
            execute: (executionContext) => {
                return definition.execute(baseNode.children.operand, executionContext);
            }
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
