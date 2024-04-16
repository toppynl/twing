import {createBaseExpressionNode, TwingBaseExpressionNode} from "../expression";

export interface TwingSpreadNode extends TwingBaseExpressionNode<"spread", {}, {
    iterable: TwingBaseExpressionNode;
}> {

}

export const createSpreadNode = (
    iterable: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingSpreadNode => {
    return createBaseExpressionNode("spread", {}, {
        iterable
    }, line, column);
};
