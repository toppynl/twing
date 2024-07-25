import {TwingBaseExpressionNode} from "./expression";
import {createBaseNode, TwingBaseNode} from "../node";

export interface TwingPrintNode extends TwingBaseNode<"print", {}, {
    expression: TwingBaseExpressionNode;
}> {
}

export const createPrintNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingPrintNode => {
    return createBaseNode("print", {}, {
        expression: expression
    }, line, column, null);
};

