import type {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes} from "../expression";
import type {TwingBaseNode} from "../../node";
import type {TwingAssignmentNode} from "./assignment";
import {createBaseExpressionNode} from "../expression";

export interface TwingArrowFunctionNode extends TwingBaseExpressionNode<"arrow_function", TwingBaseExpressionNodeAttributes, {
    body: TwingBaseExpressionNode;
    names: TwingBaseNode<any, any, Record<string, TwingAssignmentNode>>;
}> {

}

export const createArrowFunctionNode = (
    body: TwingBaseExpressionNode,
    names: TwingBaseNode<any, any, Record<any, TwingAssignmentNode>>,
    line: number,
    column: number
): TwingArrowFunctionNode => {
    return createBaseExpressionNode("arrow_function", {}, {
        body,
        names
    }, line, column);
};
