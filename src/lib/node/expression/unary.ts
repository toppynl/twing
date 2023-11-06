import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {NodeType} from "../../node";
import type {NegativeNode} from "./unary/neg";
import type {NotNode} from "./unary/not";
import type {PositiveNode} from "./unary/pos";

export type UnaryNode =
    | NegativeNode
    | NotNode
    | PositiveNode
    ;

export interface BaseUnaryNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, {
    operand: BaseExpressionNode;
}> {
}

export const createUnaryNodeFactory = <InstanceType extends BaseUnaryNode<any>>(
    type: NodeType<InstanceType>,
    operator: string
) => {
    const factory = (
        operand: BaseExpressionNode,
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
    operand: BaseExpressionNode,
    line: number,
    column: number
): BaseUnaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        operand
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw(operator)
                .raw('(')
                .subCompile(baseNode.children.operand)
                .raw(')');
        }
    };
};
