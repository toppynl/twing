import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingArrayNode} from "./array";
import type {TwingFilterNode} from "./call/filter";
import type {TwingFunctionNode} from "./call/function";
import type {TwingTestNode} from "./call/test";

export type TwingCallNode =
    | TwingFilterNode
    | TwingFunctionNode
    | TwingTestNode
    ;

export type TwingBaseCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    operatorName: string;
};

export type TwingBaseCallNodeChildren = {
    arguments: TwingArrayNode;
    operand?: TwingBaseNode;
};

export interface TwingBaseCallNode<Type extends "filter" | "function" | "test"> extends TwingBaseExpressionNode<Type, TwingBaseCallNodeAttributes, TwingBaseCallNodeChildren> {

}

export const createBaseCallNode = <Type extends "filter" | "function" | "test">(
    type: Type,
    operatorName: string,
    operand: TwingBaseNode | null,
    callArguments: TwingArrayNode,
    line: number,
    column: number
): TwingBaseCallNode<typeof type> => {
    let children: TwingBaseCallNodeChildren = {
        arguments: callArguments
    };

    if (operand !== null) {
        children.operand = operand;
    }

    return createBaseExpressionNode(type, {
        operatorName
    }, children, line, column);
};
