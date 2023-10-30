import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import {Node, NodeType} from "../../node";
import type {NegativeNode} from "./unary/neg";
import type {NotNode} from "./unary/not";
import type {PositiveNode} from "./unary/pos";

export type UnaryNode =
    | NegativeNode
    | NotNode
    | PositiveNode
    ;

export interface BaseUnaryNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, {
    operand: Node;
}> {
}

export const createUnaryNodeFactory = <InstanceType extends BaseUnaryNode<any>>(
    type: NodeType<InstanceType>,
    operator: string | null,
    definition?: {
        compile?: (compiler: Compiler, baseNode: BaseUnaryNode<NodeType<InstanceType>>) => void
    }
) => {
    const factory = (
        operand: Node,
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseUnaryNode(type, operator, operand, line, column);

        return {
            ...baseNode,
            compile: definition?.compile ? (compiler: Compiler) => definition.compile(compiler, baseNode) : baseNode.compile,
            clone: () => factory(baseNode.children.operand, line, column)
        } as InstanceType;
    };

    return factory;
};

export const createBaseUnaryNode = <Type extends string>(
    type: Type,
    operator: string,
    operand: Node,
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
        },
        clone: () => createBaseUnaryNode(type, operator, baseNode.children.operand, line, column)
    };
};
