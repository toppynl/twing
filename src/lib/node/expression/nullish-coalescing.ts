import {TwingBaseConditionalNode, createBaseConditionalNode} from "./conditional";
import {TwingExpressionNode} from "../expression";
import {createNotNode} from "./unary/not";
import {createAndNode} from "./binary/and";
import {createTestNode} from "./call/test";
import {createArrayNode} from "./array";

export interface TwingNullishCoalescingNode extends TwingBaseConditionalNode<"nullish_coalescing"> {
}

export const createNullishCoalescingNode = (
    operands: [TwingExpressionNode, TwingExpressionNode],
    line: number,
    column: number
): TwingNullishCoalescingNode => {
    const [left, right] = operands;

    if (left.type === "name") {
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

    const baseNode = createBaseConditionalNode("nullish_coalescing", testNode, left, right, line, column);

    const nullishCoalescingNode: TwingNullishCoalescingNode = {
        ...baseNode
    };

    return nullishCoalescingNode;
};
