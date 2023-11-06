import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {BaseNode} from "../../node";

export const conditionalNodeType = "conditional";

export interface BaseConditionalNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, {
    expr1: BaseNode;
    expr2: BaseNode;
    expr3: BaseNode;
}> {
}

export interface ConditionalNode extends BaseConditionalNode<typeof conditionalNodeType> {
}

export const createBaseConditionalNode = <Type extends string>(
    type: Type,
    expr1: BaseNode,
    expr2: BaseNode,
    expr3: BaseNode,
    line: number,
    column: number
): BaseConditionalNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        expr1, expr2, expr3
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw('((')
                .subCompile(baseNode.children.expr1)
                .raw(') ? (')
                .subCompile(baseNode.children.expr2)
                .raw(') : (')
                .subCompile(baseNode.children.expr3)
                .raw('))')
            ;
        }
    };
};

export const createConditionalNode = (
    expr1: BaseNode,
    expr2: BaseNode,
    expr3: BaseNode,
    line: number,
    column: number
) => createBaseConditionalNode(conditionalNodeType, expr1, expr2, expr3, line, column);
