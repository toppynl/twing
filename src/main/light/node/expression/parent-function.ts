import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export type ParentNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
};

export interface TwingParentFunctionNode extends TwingBaseExpressionNode<"parent_function", ParentNodeAttributes> {
}

export const createParentFunctionNode = (
    name: string,
    line: number,
    column: number
): TwingParentFunctionNode => {
    return createBaseExpressionNode("parent_function", {
        name,
        //output: false
    }, {}, line, column);
};
