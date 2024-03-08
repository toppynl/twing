import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingArrayNode} from "./array";
import {TwingBaseNode} from "../../node";

export type TwingMethodCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    methodName: string;
    shouldTestExistence: boolean;
};

export interface TwingMethodCallNode extends TwingBaseExpressionNode<"method_call", TwingMethodCallNodeAttributes, {
    operand: TwingBaseNode<any, {
        name: string;
    }>;
    arguments: TwingArrayNode;
}> {
}

export const createMethodCallNode = (
    operand: TwingBaseNode<any, {
        name: string;
    }>,
    methodName: string,
    methodArguments: TwingArrayNode,
    line: number,
    column: number
): TwingMethodCallNode => {
    return createBaseExpressionNode("method_call", {
        methodName,
        shouldTestExistence: false
    }, {
        operand,
        arguments: methodArguments
    }, line, column);
};

export const cloneMethodCallNode = (
    methodCallNode: TwingMethodCallNode
): TwingMethodCallNode => {
    return createMethodCallNode(
        methodCallNode.children.operand,
        methodCallNode.attributes.methodName,
        methodCallNode.children.arguments,
        methodCallNode.line,
        methodCallNode.column
    );
};
