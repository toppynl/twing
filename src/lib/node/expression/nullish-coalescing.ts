import {TwingBaseConditionalNode, conditionalNodeType, createBaseConditionalNode} from "./conditional";
import {TwingBaseExpressionNode} from "../expression";
import {createNotNode} from "./unary/not";
import {createAndNode} from "./binary/and";
import {createTestNode} from "./call/test";
import {createArrayNode} from "./array";

export const nullishCoalescingNodeType = "nullish_coalescing";

export interface TwingNullishCoalescingNode extends TwingBaseConditionalNode<typeof nullishCoalescingNodeType> {
}

export const createNullishCoalescingNode = (
    operands: [TwingBaseExpressionNode, TwingBaseExpressionNode],
    line: number,
    column: number
): TwingNullishCoalescingNode => {
    const [left, right] = operands;
    
    if (left.is("name")) {
        left.attributes.isAlwaysDefined = true;
    }
    
    const testNode = createAndNode(
        [
            createTestNode(left, "defined", createArrayNode([], line, column), line, column),
            createNotNode(
                createTestNode(
                    left,
                    'null',
                    createArrayNode([], line, column),
                    line, column
                ),
                line,
                column
            )
        ],
        line,
        column
    );

    const baseNode = createBaseConditionalNode(nullishCoalescingNodeType, testNode, left, right, line, column);
    
    const node: TwingNullishCoalescingNode = {
        ...baseNode,
        is: (aType) => aType === node.type || aType === conditionalNodeType
    };

    return node;
};
