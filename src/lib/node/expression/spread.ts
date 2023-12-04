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
    const baseNode = createBaseExpressionNode("spread", {}, {
        iterable
    }, line, column);

    const spreadNode: TwingSpreadNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {iterable} = spreadNode.children;

            return iterable.execute(executionContext);
        }
    };

    return spreadNode;
};