import {createBaseExpressionNode, TwingBaseExpressionNode} from "../expression";

export const spreadNodeType = "spread";

export interface TwingSpreadNode extends TwingBaseExpressionNode<typeof spreadNodeType, {}, {
    iterable: TwingBaseExpressionNode;
}> {

}

export const createSpreadNode = (
    iterable: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingSpreadNode => {
    const baseNode = createBaseExpressionNode(spreadNodeType, {}, {
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