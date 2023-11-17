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
        compile: (compiler) => {
            compiler
                .write('((')
                .subCompile(baseNode.children.expr1)
                .write(') ? (')
                .subCompile(baseNode.children.expr2)
                .write(') : (')
                .subCompile(baseNode.children.expr3)
                .write('))')
            ;
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
