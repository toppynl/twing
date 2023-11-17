import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingNodeType} from "../../node";
import type {TwingNegativeNode} from "./unary/neg";
import type {TwingNotNode} from "./unary/not";
import type {TwingPositiveNode} from "./unary/pos";

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
    operator: string
) => {
    const factory = (
        operand: TwingBaseExpressionNode,
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseUnaryNode(type, operator, operand, line, column);

        return {
            ...baseNode
        } as InstanceType;
    };

    return factory;
};

export const createBaseUnaryNode = <Type extends string>(
    type: Type,
    operator: string,
    operand: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingBaseUnaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        operand
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write(operator)
                .write('(')
                .subCompile(baseNode.children.operand)
                .write(')');
        }
    };
};
